// we could decide to have more specific helpers to make the code lighter for func templates
// clickedObjectIDsAfterSearch(payload)
// etc
export function clickedObjectIDsAfterSearch(objectID, payload) {
  return writeData({
    method: 'clickedObjectIDsAfterSearch',
    objectID,
    payload,
  });
}

export function convertedObjectIDsAfterSearch(objectID, payload) {
  return writeData({
    method: 'convertedObjectIDsAfterSearch',
    objectID,
    payload,
  });
}

function writeData({ method, objectID, payload }) {
  // TODO: serialize payload in base64
  let serializedPayload;
  if (typeof payload === 'string') {
    serializedPayload = payload;
  } else if (typeof payload === 'object') {
    try {
      serializedPayload = JSON.stringify(payload);
    } catch (e) {
      throw new Error(
        `The analytics helper expects payload to be either a string or a JSON object`
      );
    }
  }
  return `data-analytics-method="${method}" data-analytics-object-id="${objectID}" 
     data-analytics-payload='${serializedPayload}'`;
}
export function hasData(domElement) {
  return !!domElement.getAttribute('data-analytics-method');
}
export function readData(domElement) {
  const method = domElement.getAttribute('data-analytics-method');
  const objectID = domElement.getAttribute('data-analytics-object-id');
  const serializedPayload = domElement.getAttribute('data-analytics-payload');
  let payload;
  if (typeof serializedPayload !== 'string') {
    throw new Error(
      `The analytics helper expects payload to be either a string or a JSON object`
    );
  }

  // TODO: unserialize payload in base64
  try {
    payload = JSON.parse(serializedPayload);
  } catch (e) {
    // assume it's the eventName
    payload = { eventName: serializedPayload };
  }
  return { method, objectID, payload };
}
