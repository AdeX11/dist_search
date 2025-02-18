

# M2: Actors and Remote Procedure Calls (RPC)


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M2 (`hours`) and the lines of code per task.


My implementation comprises five  software components, totaling 400 lines of code. Key challenges included using function calls across multiple files and sending messages across nodses. Understanding some of the temolate code was also quite hard. I was able to solve this by focusing on the test for a specific component and moving from there.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote five tests; these tests take 1.02 seconds to execute.


*Performance*: I characterized the performance of comm and RPC by sending 1000 service requests in a tight loop. Average throughput and latency is recorded in `package.json`.


## Key Feature

> How would you explain the implementation of `createRPC` to someone who has no background in computer science — i.e., with the minimum jargon possible?
create rpc enables another computer to call a given function on our computer. we basically give someone else the ability to do some computations for us and return the results

