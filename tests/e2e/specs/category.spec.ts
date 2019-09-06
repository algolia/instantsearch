describe('InstantSearch - Search on specific category', () => {
  it('navigates to the e-commerce demo', async () => {
    await browser.url('examples/e-commerce/');
  });

  it('selects "Appliances" category in list', async () => {
    await browser.clickHierarchicalMenuItem('Appliances');
  });

  it('selects "Small Kitchen Appliances" category in list', async () => {
    await browser.clickHierarchicalMenuItem('Small Kitchen Appliances');
  });

  it('must have the expected results for "Small Kitchen Appliances"', async () => {
    const hitsTitles = await browser.getHitsTitles();

    expect(hitsTitles).toEqual([
      'Insignia™ - 2.6 Cu. Ft. Compact Refrigerator - Black',
      'Keurig - K50 Coffeemaker - Black',
      'Keurig - K200 Brewer - Black',
      'Frigidaire - 3.3 Cu. Ft. Compact Refrigerator - Stainless Steel',
      'Ninja - Mega Kitchen System 72-Oz. Blender - Black',
      'Ninja - Nutri Ninja Pro 24-Oz. Blender - Black/Silver',
      'Oster - Inspire 2-Slice Wide-Slot Toaster - Black',
      'Keurig - The Original Donut Shop K-Cup® Pods (18-Pack)',
      'Chefman - Express Air Fryer - Black',
      'Oster - 10-Speed Blender - Black',
      'Keurig - Swiss Miss Milk Chocolate Hot Cocoa K-Cup® Pods (16-Pack)',
      'Keurig - Cinnabon Classic Cinnamon Roll K-Cup® Pods (18-Pack) - Multi',
      'Ninja - Nutri Ninja 32 Oz. Auto-iQ Blender - Black',
      'Anova - Precision Cooker WiFi',
      'Nespresso - VertuoLine Evoluo Espresso Maker/Coffeemaker - Gray',
      'Magic Bullet - Blender - Silver/Black',
    ]);
  });

  it('unselects "Small Kitchen Appliances" category in list', async () => {
    await browser.clickHierarchicalMenuItem('Small Kitchen Appliances');
  });

  it('must have the expected results for "Appliances"', async () => {
    const hitsTitles = await browser.getHitsTitles();

    expect(hitsTitles).toEqual([
      'Nest - Learning Thermostat - 3rd Generation - Stainless Steel',
      'LG - 1.1 Cu. Ft. Mid-Size Microwave - Stainless-Steel',
      'Insignia™ - 2.6 Cu. Ft. Compact Refrigerator - Black',
      'Keurig - K50 Coffeemaker - Black',
      'iRobot - Roomba 650 Vacuuming Robot - Black',
      'Shark - Navigator Lift-Away Deluxe Bagless Upright Vacuum - Blue',
      'LG - 1.5 Cu. Ft. Mid-Size Microwave - Stainless Steel',
      'Insignia™ - 5.0 Cu. Ft. Chest Freezer - White',
      'Samsung - activewash 4.8 Cu. Ft. 11-Cycle High-Efficiency Top-Loading Washer - White',
      'Samsung - 4.8 Cu. Ft. 11-Cycle High-Efficiency Top-Loading Washer - White',
      'LG - 2.0 Cu. Ft. Full-Size Microwave - Stainless Steel',
      'Shark - Rotator Professional Lift-Away HEPA Bagless 2-in-1 Upright Vacuum - Red',
      'LG - 4.5 Cu. Ft. 8-Cycle High-Efficiency Top-Loading Washer - White',
      'Samsung - 4.2 Cu. Ft. 9-Cycle High-Efficiency Steam Front-Loading Washer - Platinum',
      'Panasonic - 1.3 Cu. Ft. Mid-Size Microwave - Stainless steel/black/silver',
      'LG - 2.0 Cu. Ft. Mid-Size Microwave - Black Stainless',
    ]);
  });
});
