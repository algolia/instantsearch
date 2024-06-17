export function createPaginationTestSuite(flavor: string) {
  const root = `examples/${flavor}/e-commerce/`;

  describe('page navigation', () => {
    it('navigates to the e-commerce demo', async () => {
      await browser.url(root);
    });

    it('navigates to next page', async () => {
      await browser.clickNextPage();
    });

    it('must have the expected results for page 2', async () => {
      const hitsTitles = await browser.getHitsTitles();

      expect(hitsTitles).toEqual([
        'Insignia™ - 55" Class - (54.6" Diag.) - LED - 1080p - HDTV - Black',
        'HP - 15.6" Laptop - AMD A6-Series - 4GB Memory - 500GB Hard Drive - Black',
        'Nintendo - amiibo Figure (The Legend of Zelda: Breath of the Wild Series Bokoblin)',
        'AT&T GoPhone - Samsung Galaxy Express 3 4G LTE with 8GB Memory Prepaid Cell Phone',
        'Insignia™ - 32" Class - (31.5" Diag.) - LED - 720p - HDTV - Black',
        'Lenovo - 110-15ISK 15.6" Laptop - Intel Core i3 - 4GB Memory - 1TB Hard Drive - Black',
        'Amazon - Echo Dot',
        'Harman/kardon - Onyx Mini Portable Wireless Speaker - Black',
        'Insignia™ - Portable Wireless Speaker - Black',
        'Insignia™ - 92 Bright Multipurpose Paper - White',
        'Apple - MacBook Pro with Retina display - 13.3" Display - 8GB Memory - 128GB Flash Storage - Silver',
        'SanDisk - Ultra Plus 32GB microSDHC Class 10 UHS-1 Memory Card - Gray/Red',
        'Amazon - Fire TV (2015 Model) - Black',
        'GoPro - HERO5 Black 4K Action Camera',
        'Epson - Expression Home XP-430 Small-in-One Wireless All-In-One Printer',
        'Beats by Dr. Dre - Powerbeats2 Wireless Earbud Headphones - Black/Red',
      ]);
    });

    it('selects "Appliances" in the category menu', async () => {
      await browser.clickHierarchicalMenuItem('Appliances');
    });

    it('must reset the page to 1', async () => {
      const page = await browser.getCurrentPage();

      expect(page).toEqual(1);
    });

    it('must have the expected results for page 1', async () => {
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

    it('navigates to page 3', async () => {
      await browser.clickPage(3);
    });

    it('must have the expected results for page 3', async () => {
      const hitsTitles = await browser.getHitsTitles();

      expect(hitsTitles).toEqual([
        'Keurig - Swiss Miss Milk Chocolate Hot Cocoa K-Cup® Pods (16-Pack)',
        'Samsung - 4.5 Cu. Ft. 14-Cycle Addwash™ High-Efficiency Front-Loading Washer with Steam - Black Stainless',
        'Keurig - Cinnabon Classic Cinnamon Roll K-Cup® Pods (18-Pack) - Multi',
        'Dyson - V8 Absolute Bagless Cordless Stick Vacuum - Multi',
        'Honeywell - 1 Gal. Warm Moisture Humidifier - Black',
        'Ninja - Nutri Ninja 32 Oz. Auto-iQ Blender - Black',
        'Anova - Precision Cooker WiFi',
        'Nespresso - VertuoLine Evoluo Espresso Maker/Coffeemaker - Gray',
        'LG - 0.7 Cu. Ft. Compact Microwave - Stainless-Steel',
        'Samsung - 1.8 Cu. Ft. Over-the-Range Microwave - Stainless Steel',
        'Dyson - V6 Motorhead Bagless Cordless Stick Vacuum - Fuchsia/Iron',
        'LG - 7.4 Cu. Ft. 8-Cycle Electric Dryer - White',
        'Samsung - 7.5 Cu. Ft. 11-Cycle Electric Dryer with Steam - Platinum',
        'ecobee - ecobee3 Programmable Touch-Screen Wi-Fi Thermostat (2nd Generation) - Black/White',
        'LG - Stacking Kit for Most 27" LG Washers and Dryers - Chrome',
        'Magic Bullet - Blender - Silver/Black',
      ]);
    });
  });
}
