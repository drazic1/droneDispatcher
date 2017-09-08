// Total Complexity: O(n*logn) + O(k*logk)
// where n and k are size of drones and packages arrays respectively
// All Dispatcher helpers are O(1)

/**
 * Variables and constants declaration
 */
const fetch = require("node-fetch");
const Dispatcher = require("./Dispatcher.js");

const drones = fetch("https://codetest.kube.getswift.co/drones")
  .then(response => {
    return response.json();
  })
  .catch(error => {
    console.error(error);
  });

const packages = fetch("https://codetest.kube.getswift.co/packages")
  .then(response => {
    return response.json();
  })
  .catch(error => {
    console.error(error);
  });

// Once all apis have responded --> make assingments
Promise.all([drones, packages]).then(values => {
  const depoInfo = {
    address: "303 Collins St, Melbourne VIC 3000, Australia",
    // Coordinates for "303 Collins St, Melbourne VIC 3000, Australia"
    location: {
      latitude: -37.816664,
      longitude: 144.9616589
    }
  };
  const dispatcher = new Dispatcher(depoInfo);
  dispatcher.setDrones(values[0]);
  dispatcher.setPackages(values[1]);
  dispatcher.organizeDrones();
  dispatcher.organizePackages();
  dispatcher.makeAssingment();
  dispatcher.printSolution();
});
