class Dispatcher {
  constructor(geoInfo) {
    this.drones = [];
    this.packages = [];
    this.solution = {
      assignments: [],
      unassignedPackageIds: []
    };
    this.depo = geoInfo;
  }

  setPackages(packageList) {
    this.packages = packageList;
  }

  setDrones(droneList) {
    this.drones = droneList;
  }

  /**
   * Complexity: O(n*logn) + O(n)
   */
  organizeDrones() {
    // Add penalty to each drone
    // Penalty represents time needed to start delivery of a new package
    // Complexity: O(n)
    this.drones.map(drone => {
      drone.penalty = this.calculatePenalty(drone);
    });
    // Make drones array a queue of "faster" drones
    // Complexity: O(n*logn)
    this.drones.sort((drone1, drone2) => {
      return drone1.penalty - drone2.penalty;
    });
  }

  /**
   * Complexity: O(k*logk) + O(k)
   */
  organizePackages() {
    // Add minimum time required to deliver each package
    // minimumTimeToDeliver represents the time from depo to package destination
    // Complexity: O(k)
    this.packages.map(aPackage => {
      aPackage.minimumTimeToDeliver = Dispatcher.calculateTime(
        this.depo.location,
        aPackage.destination
      );
    });
    // Make packages a queue of highest priority packages
    // Complexity: O(k*logk)
    this.packages.sort((package1, package2) => {
      return package1.deadline - package2.deadline;
    });
  }

  /**
   * Complexity: O(max(k,n))
   */
  makeAssingment() {
    let packageLooper = 0;
    let droneLooper = 0;
    // Loop until run out of drones or packages
    while (
      packageLooper < this.packages.length &&
      droneLooper < this.drones.length
    ) {
      const now = new Date().getTime() / 1000;
      const availableTimeToDeliver =
        this.packages[packageLooper].deadline - now;
      const neededTimeToDeliver =
        this.drones[droneLooper].penalty +
        this.packages[packageLooper].minimumTimeToDeliver;
      if (availableTimeToDeliver > neededTimeToDeliver) {
        //assign a drone to the package
        this.solution.assignments.push({
          droneId: this.drones[droneLooper].droneId,
          packageId: this.packages[packageLooper].packageId,
          timeToDeliver: neededTimeToDeliver,
          windowToDeliver: availableTimeToDeliver
        });
        packageLooper += 1;
        droneLooper += 1;
      } else {
        //No drone can deliver it fast enough. Add it to unassigned
        this.solution.unassignedPackageIds.push(
          this.packages[packageLooper].packageId
        );
        packageLooper += 1;
      }
    }

    // If we still have packages to assign, it means we run out of drones to deliver.
    // So the rest of the packages cannot be assigned
    if (packageLooper < this.packages.length) {
      // Add left packages to undelivered packages list.
      this.solution.unassignedPackageIds = this.solution.unassignedPackageIds.concat(
        this.packages
          .slice(packageLooper, this.packages.length)
          .map(aPackage => aPackage.packageId)
      );
    }
  }

  printSolution() {
    console.log("Printing assigments with the following information:");
    console.log(
      "droneId, packageId, time Needed Until delivery is made, Maximum Time permited for the delivery"
    );
    console.log(this.solution);
  }

  /**
   * 
   * @param {*} drone 
   * @return penalty in seconds until empty arrival to depo
   */
  calculatePenalty(drone) {
    let penalty;
    if (drone.packages.length > 0) {
      // If drone has packages, penalty = timeToDeliveryInProgress + timeBackToDepo
      const toDelivery = Dispatcher.calculateTime(
        drone.location,
        drone.packages[0].destination
      );
      const toDepo = Dispatcher.calculateTime(
        drone.packages[0].destination,
        this.depo.location
      );
      penalty = toDelivery + toDepo;
    } else {
      // If drone is empty, penalty = timeBackToDepo
      penalty = Dispatcher.calculateTime(drone.location, this.depo.location);
    }
    return penalty;
  }

  /**
   * 
   * @param {*} from 
   * @param {*} to 
   * @return distance in km
   */
  static distanceFromTo(from, to) {
    const latA = from.latitude * Math.PI / 180;
    const lonA = from.longitude * Math.PI / 180;
    const latB = to.latitude * Math.PI / 180;
    const lonB = to.longitude * Math.PI / 180;
    return (
      6372.795477e3 *
      Math.acos(
        Math.sin(latA) * Math.sin(latB) +
          Math.cos(latA) * Math.cos(latB) * Math.cos(lonA - lonB)
      ) /
      1000
    );
  }

  /**
   * 
   * @param {*} from 
   * @param {*} to 
   * @return time in seconds
   */
  static calculateTime(from, to) {
    const speed = 50 / 3600; // km/s
    const time = Dispatcher.distanceFromTo(from, to) / speed;
    return time;
  }
}

module.exports = Dispatcher;
