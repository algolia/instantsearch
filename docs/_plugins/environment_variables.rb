module Jekyll
  class EnvironmentVariablesGenerator < Generator

    def generate(site)
      site.config['env'] = ENV['JEKYLL_ENV'] || 'development'
      site.config['version'] = ENV['VERSION'] || 'X.Y.Z-dev'
    end

  end
end
