require 'sass'
require 'autoprefixer-rails'

module Jekyll
  module Converters
    ## redefine the #convert method to add auto-prefixing
    class Scss
      def convert(content)
        css = ::Sass.compile(content, sass_configs)
        AutoprefixerRails.process(css).to_s
      rescue ::Sass::SyntaxError => e
        raise SyntaxError.new("#{e.to_s} on line #{e.sass_line}")
      end
    end
  end
end
