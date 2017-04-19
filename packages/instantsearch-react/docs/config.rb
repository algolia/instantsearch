# https://github.com/middleman/middleman/issues/1857#issuecomment-200930893
# the source directory of webpack should exists before starting
require 'fileutils'
FileUtils.mkdir_p('.webpack')
FileUtils.rm_rf(Dir.glob('.webpack/*'))

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :gzip
  activate :livereload, ignore: [%r{javascripts}]
  activate :external_pipeline,
    name: 'site',
    command: 'webpack --watch --config webpack.config.babel.js',
    source: '.webpack'
end

set :js_dir, 'js'
ignore '/javascripts/*'

set :markdown_engine, :kramdown
set :markdown, input: 'GFM',
               # http://kramdown.gettalong.org/options.html#option-hard-wrap
               # apply same behavior than on github
               hard_wrap: false
