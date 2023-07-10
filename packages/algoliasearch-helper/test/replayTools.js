'use strict';
module.exports = {
  toSaver: wrapHelperToSave,
};

var fs = require('fs');
var path = require('path');

/**
 * Monkey-patch a Helper constructor to spy
 * on data from Algolia and save the server response.
 * This is used to created data for tests.
 * @param {Helper} Helper a vanilla Helper constructor function
 * @param {string} folderName the folder where to save the data
 * @return {HelperSaver} a Helper enhnaced with save function
 */
function wrapHelperToSave(Helper, folderName) {
  var savedParameters = {};

  createFolderIfNone(folderName);

  function WrappedHelper() {
    Helper.apply(this, Array.prototype.slice.call(arguments));
  }

  WrappedHelper.prototype = Object.create(Helper.prototype);
  WrappedHelper.prototype.constructor = WrappedHelper;
  WrappedHelper.prototype._handleResponse = function (
    state,
    queryId,
    err,
    content
  ) {
    savedParameters.state = state;
    savedParameters.error = err;
    savedParameters.content = content;

    Helper.prototype._handleResponse.apply(
      this,
      Array.prototype.slice.call(arguments)
    );
  };
  WrappedHelper.prototype.searchOnce = function (options) {
    var state = this.state.setQueryParameters(options);

    return Helper.prototype.searchOnce.call(this, state).then(
      function (contentAndState) {
        savedParameters.content = contentAndState._originalResponse;
        savedParameters.state = contentAndState.state;
        savedParameters.error = null;
        return contentAndState;
      },
      function (error) {
        savedParameters.content = null;
        savedParameters.state = state;
        savedParameters.error = error;
        throw error;
      }
    );
  };
  WrappedHelper.prototype.__getParameters = function () {
    return savedParameters;
  };
  WrappedHelper.prototype.__saveLastToFile = function (filename) {
    // folder if it doesn't exist
    // create filename.json
    // save json of savedParameters to file
    var filePath = path.join(folderName, filename);
    fs.writeFileSync(filePath, JSON.stringify(savedParameters, null, 2));
  };

  return WrappedHelper;
}

function createFolderIfNone(folderPath) {
  try {
    fs.statSync(folderPath);
  } catch (err) {
    try {
      fs.mkdirSync(folderPath);
    } catch (e2) {
      console.error("can't create folder");
    }
  }
}
