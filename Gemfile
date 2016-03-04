# Ruby Gems for building and testing Bootstrap
# Run `grunt update-gemfile-lock` to update to the latest compatible versions

source 'https://rubygems.org'

group :development, :test do
  gem 'jekyll'
  gem 'haml'
  gem 'sass'
  gem 'uglifier'
  gem 'guard'
  gem 'nokogiri'
  gem 'autoprefixer-rails'
  gem 'thin'
  gem 'guard-jekyll-plus'
  gem 'guard-livereload'
  gem 'guard-bundler', require: false
end

group :jekyll_plugins do
  gem 'algoliasearch-jekyll', '~> 0.5.3'
  # using the github for now, there's a bug with scss + liquid tags
  gem "jekyll-assets", :github => 'jekyll/jekyll-assets'
  gem 'jekyll-contentblocks'
end
