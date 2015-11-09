require 'nokogiri'

module Jekyll

  module TOCGenerator
    @@selector = 'h1, h2, h3, h4:not(.no-toc)'

    def toc_generate(html)
      doc = Nokogiri::HTML(html)

      html = []
      current_level = 1
      doc.css(@@selector).each do |tag|
        level = tag.name[1].to_i
        if level > current_level
          current_level.upto(level - 1) do
            html << '<ul>'
          end
        elsif level < current_level
          level.upto(current_level - 1) do
            html << '</ul>'
          end
        end
        html << "<li><a href=\"##{tag['id']}\">#{tag.text}</a></li>"
        current_level = level
      end

      html << '</ul>'

      html.join
    end

    def toc_generate_menu(html)
      doc = Nokogiri::HTML(html)

      html = []
      html << '<select>'
      current_level = 1
      doc.css(@@selector).each do |tag|
        level = tag.name[1].to_i
        html << "<option value=\"##{tag['id']}\">#{tag.text}</option>"
        current_level = level
      end

      html << '</select>'

      html.join
    end
  end

end

Liquid::Template.register_filter(Jekyll::TOCGenerator)
