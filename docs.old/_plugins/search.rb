# Extracting custom indexing methods in its own class
class CustomSearchHelper
  def self.hook_each(item, node)
    return nil if excluded_page(item)

    # Get a full url, including anchor
    item[:url] = url(item)

    # Get the full hierarchy of the element, including page name and h1 to h6
    hierarchy =  hierarchy(item)
    return nil if hierarchy.length < 2
    item[:hierarchy] = hierarchy

    # Explode the hierarchy in three parts for display
    item[:category] = hierarchy[0]
    item[:subcategory] = hierarchy[1]
    if hierarchy.length == 2
      item[:display_title] = "Go to #{item[:subcategory]}"
    else
      item[:display_title] = [hierarchy[2], hierarchy[-1]].uniq.compact.join(' › ')
    end

    # Set title as the text for headers, remove title otherwise
    if %w(h1 h2 h3 h4 h5 h6).include?(item[:tag_name])
      item[:title] = item[:text]
      item[:text] = nil
    else
      # Remove title if not a header
      item[:title] = nil
    end

    {
      url: item[:url],
      tag_name: item[:tag_name],
      text: item[:text],
      title: item[:title],
      display_title: item[:display_title],
      category: item[:category],
      subcategory: item[:subcategory],
      hierarchy: item[:hierarchy],
      weight_tag_name: weight_tag_name(item),
      weight_order: weight_order_in_page(item)
    }
  end

  def self.excluded_page(item)
    false
  end

  def self.hierarchy(item)
    hierarchy = []
    hierarchy << item[:title]
    # Add parent hierarchy
    %w(h1 h2 h3 h4 h5 h6).each do |h|
      hierarchy << item[h.to_sym] if item[h.to_sym]
    end

    hierarchy
  end

  # get the full url with anchor
  def self.url(item)
    anchor = nil
    anchor = item[:css_selector_parent] if item[:css_selector_parent] =~ /^#/
    anchor = item[:css_selector] if item[:css_selector] =~ /^#/
    url = item[:url]
    url = item[:permalink] if item[:permalink]
    "#{url}#{anchor}"
  end

  # Set weight based on tag name (h1: 90, h6: 40, p: 0)
  def self.weight_tag_name(item)
    tag_name = item[:tag_name]
    return 0 if tag_name == 'p'
    100 - tag_name.gsub('h', '').to_i * 10
  end

  # Order of the node in the page source
  def self.weight_order_in_page(item)
    item[:objectID].to_s.split('_').last.to_i
  end
end

# Overwrite Algolia Jekyll plugin with custom hooks
class AlgoliaSearchRecordExtractor
  def custom_hook_each(item, node)
    CustomSearchHelper.hook_each(item, node)
  end

  # Add a new record for the h1 of each page, allowing to search for pages by
  # name
  def custom_hook_all(items)
    grouped_by_page = items.group_by do |i|
      "#{i[:category]}-#{i[:subcategory]}"
    end
    grouped_by_page.each do |_, pages|
      page_record = {
        category: pages[0][:category],
        hierarchy: pages[0][:hierarchy],
        subcategory: pages[0][:subcategory],
        tagname: 'h1',
        text: nil,
        display_title: "Go to #{pages[0][:subcategory]}",
        title: pages[0][:category],
        url: pages[0][:url],
        weight_tag_name: 90,
        weight_order: -1
      }
      items << page_record
    end
    items
  end

  # We'll keep <code> tags in our records, for better display
  def node_text(node)
    return node.text.gsub('<', '&lt;').gsub('>', '&gt;') if node.text?

    return node.to_s if node.name =~ /code/

    node.children.map { |child| node_text(child) }.join('').strip
  end
end