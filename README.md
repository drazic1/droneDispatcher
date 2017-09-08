# GetSwift Drone Delivery

## Installation
npm install

## Run solution
npm start

## Dependencies
The solution makes use of node-fetch which implements the new ES6 Promises to make API requests. A version of node.js v4 or newer is therefore required for the solution to work properly.

## The scenario
You run a drone delivery company. Packages arrive at your depo to be delivered by your fleet of drones.

## The problem
The solution should take two inputs: a list of drones, and a list of packages; and produce two outputs: a list of assignments of packages to drones, and a list of packages that could not be assigned. For example, it could produce the following output:

```javascript
{
  assignments: [{droneId: 1593, packageId: 1029438}, {droneId: 1251, packageId: 1029439}]
  unassignedPackageIds: [109533, 109350, 109353]
}
```

### Constraints
There's a number of constraints that the solution must obey:

- The depo is located at 303 Collins Street, Melbourne, VIC 3000
- Drones might already be carrying a package. The time to deliver this package should be taken into account when comparing drones.
- Once a drone is assigned a package, it will fly in a straight line to its current destination (if it already has a package), then to the depo, then to the new destination
- Packages must only be assigned to a drone that can complete the delivery by the package's delivery deadline
- Packages should be assigned to the drone that can deliver it soonest
- A drone should only appear in the assignment list at most once; this is a dispatching problem, not a routing problem. For example, this is allowed:
```javascript
{
  assignments: [{droneId: 1593, packageId: 1029438}, {droneId: 1251, packageId: 1029439}]
  unassignedPackageIds: [109533, 109350, 109353]
}
```
but this is not allowed:
```javascript
{
  assignments: [{droneId: 1593, packageId: 1029438}, {droneId: 1593, packageId: 1029439}]
  unassignedPackageIds: [109533, 109350, 109353]
}
```

### Assumptions
Simplifying assumptions:

- Drones have unlimited range
- Drones travel at a fixed speed of 50km/h
- Packages are all the same weight and volume
- Packages can be delivered early
- Drones can only carry one item at a time

Solution should integrate with [this API](https://codetest.kube.getswift.co/drones) which generates randomized data.

Use any language and/or framework to solve this. Please also give an indication of how you envisage your solution will be deployed, and what other components it might interact with.

## The API
The API lives at https://codetest.kube.getswift.co/drones. Two methods:

### `GET /drones`
This returns a randomized list of drones. A drone can have up to one package assigned to it.

```javascript
[
    {
        "droneId": 321361,
        "location": {
            "latitude": -37.78290448241537,
            "longitude": 144.85335277520906
        },
        "packages": [
            {
                "destination": {
                    "latitude": -37.78389758422243,
                    "longitude": 144.8574574322506
                },
                "packageId": 7645,
                "deadline": 1500422916
            }
        ]
    },
    {
        "droneId": 493959,
        "location": {
            "latitude": -37.77718638788778,
            "longitude": 144.8603578487479
        },
        "packages": []
    }
]
```

### `GET /packages`
This returns a randomized list of packages. Solution assigns the packages from this endpoint to the drones returned from the other endpoint. The deadline here is a Unix timestamp.

```javascript
[
    {
        "destination": {
            "latitude": -37.78404125474984,
            "longitude": 144.85238118232522
        },
        "packageId": 8041,
        "deadline": 1500425202
    },
    {
        "destination": {
            "latitude": -37.77058198385452,
            "longitude": 144.85157121265505
        },
        "packageId": 8218,
        "deadline": 1500423287
    }
]
```

## Analysis
After you've implemented your solution, try answering the following questions. We're not really looking for a particular answer; we're more interested in how well you understand your choices, and how well you can justify them.

- How did you implement your solution?

I chose Node.js and Javascript to develop my solution. The main reason to do this was that Javascrit is the programming language I feel more comfortable with. 
In short, the main algorithm of my solution takes the list of packages and sorts them by priority (priority being the remaining time to be delivered). Similarly takes the list of drones and sorts them based on how fast they can be ready to deliver a package (since some of them need to first make a another delivery and come back to the depo and others need to at least come to the depo). As a last step, the algotrithm goes package by package and assigns it to the drone that can deliver it faster.

- Why did you implement it this way?

The first solution that came to mind was a brute force one in which you loop through all the packages looking for the one with the highest priority. Once you find it, you loop through all the drones trying to look for the one that can deliver that package faster.
Assuming n represents the number of drones and k the number of packages, this process would take ((O(n)+O(k)) * O(k)) ~= O(k^2) time to run since you need to loop through all the packages and all the drones everytime for every package.
In these cases, I like to use a more expensive algorithm first (such as the sort one) to gain on the consecutive searches. This gave me the solution I described in the previous question and the one I implemented. The complexity of this solution is O(k*logk) + O(k) + O(n*logn) + O(n) which is faster than the brute force. The log terms of the equation correspond to the sorting parts and the (n) and (k) ones to the calculating priority parts.

At an architectural level, I implemented the solution mainly as a Dispatcher class. The reason to do it this way was thinking about potentially having several depos. Each dispatcher would be assigned to a depo (one new dispatcher object per depo) and it would control deliveries performed from that depo. The algorithm in index.js just creates the dispatcher and calls the actions.

- Let's assume we need to handle dispatching thousands of jobs per second to thousands of drivers. Would the solution you've implemented still work? Why or why not? What would you modify? Feel free to describe a completely different solution than the one you've developed.

For the solution to handle several thousdands of dispatches per second, I would probably use a different data structure like a heap to keep track of available drones and another heap for packages to be delivered. This way, all new "packages to be dispatches" and "available drones" that we receive, can be inserted into the sorted heap relatively cheap (O(logn)) compared to having to sort the queues each time (O(nlogn)). This solution would work best together with an API that would return only those drones that have not been assigned to a package and packages that have not being assigned to a drone yet by the dispatcher, so that they can be added to the dispatcher's internal data structures, the heaps.     

### Assessment
As a rough guide, we look at the following points to assess an analysis:

1. Are there any logical errors?
2. Are there any outright factual errors?
3. Are important tradeoffs identified and analysed? Is the effort put into each tradeoff proportionate to its severity, or is a lot of time spent on analysing a trivial problem, while more pressing concerns are left untouched?
4. What doesn't the analysis cover? How is the scope of the solution framed? Do we get a sense of where the solution is situated in the solution space, and where we can we move to?

## Submission
Please create a *new repository* (don't fork this one) and then email the url to joash at getswift dot co, prefixing the subject with `CODETEST:`
