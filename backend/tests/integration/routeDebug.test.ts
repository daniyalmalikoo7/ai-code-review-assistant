// backend/tests/integration/routeDebug.test.ts
import app from '../../src/app';

describe('Route Debugging Test', () => {
  test('Print all registered routes', () => {
    // Check if app._router exists and has stack property
    if (app._router && app._router.stack) {
      console.log('\n----- REGISTERED ROUTES -----');
      
      // Function to print routes
      const printRoutes = (path: string, layer: any) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods)
            .filter((method) => layer.route.methods[method])
            .join(', ');
          console.log(`${methods.toUpperCase()} ${path}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle.stack) {
          // It's a router middleware
          const routerPath = path + (layer.regexp.toString().indexOf('\\/(?=\\/|$)') >= 0 ? '' : layer.regexp.toString().replace(/\\|\(|\)/g, '').replace('/^', '').replace('/?(?=/|$)', '').replace('$/', ''));
          
          layer.handle.stack.forEach((stackItem: any) => {
            printRoutes(routerPath, stackItem);
          });
        }
      };
      
      // Loop through all middleware
      app._router.stack.forEach((layer: any) => {
        printRoutes('', layer);
      });
      
      console.log('----- END ROUTES -----\n');
    } else {
      console.log('No routes found or app structure is different than expected');
    }
    
    // Always pass this test
    expect(true).toBe(true);
  });
});