module Jekyll
  class BodyClassTag < Liquid::Tag

    def generate_body_class(prefix, id)
      id = id.gsub(/\.\w*?$/, '').gsub(/[-\/]/, '_').gsub(/^_/, '') # Remove extension from url, replace '-' and '/' with underscore, Remove leading '_'

      case prefix
      when "class"
        prefix = ""
      else
        prefix = "#{prefix}_"
      end

      "#{prefix}#{id}"
    end

    def render(context)
      page = context.environments.first["page"]
      classes = []

      %w[class url categories tags layout].each do |prop|
        next unless page.has_key?(prop)
        if page[prop].kind_of?(Array)
          page[prop].each { |proper| classes.push generate_body_class(prop, proper) }
        else
          classes.push generate_body_class(prop, page[prop])
        end
      end

      classes.join(" ")
    end

  end

  Liquid::Template.register_tag('body_class', BodyClassTag)
end
