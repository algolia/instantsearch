module Jekyll
  class AssetUrlTag < Liquid::Tag
    PARAMS_RE  = / ^
                     \s*
                     (?: "(?<path>[^"]+)" | '(?<path>[^']+)' | (?<path>[^ ]+) )
                     (?<attrs>.*?)
                     (?: \[(?<options>.*)\] )?
                     \s*
                     $
                   /x

    def render(context)
      site = context.registers[:site]
      match = @markup.strip.match(PARAMS_RE)

      File.join(site.config['host'], site.asset_path(match['path']))
    end
  end
end

Liquid::Template.register_tag('asset_url', Jekyll::AssetUrlTag)
