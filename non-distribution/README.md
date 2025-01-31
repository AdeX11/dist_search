# M0: Setup & Centralized Computing

> Add your contact information below and in `package.json`.

* name: `<Adebowale Adelekan>`

* email: `<adebowale_adelekan@brown.edu?>`

* cslogin: `<aeadelek>`


## Summary

> Summarize your implementation, including the most challenging aspects; remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete M0 (`hours`), the total number of JavaScript lines you added, including tests (`jsloc`), the total number of shell lines you added, including for deployment and testing (`sloc`).


My implementation consists of seven components addressing T1--8. The most challenging aspect was testing because I kept discovering new bugs and also I had to come up with teh correct answer for waht in some cases was a lo of infoormation.


## Correctness & Performance Characterization


> Describe how you characterized the correctness and performance of your implementation.


To characterize correctness, we developed eleven tests that test the following cases: Roughly speaking, the tests cover empty cases, duplicate cases, and ensuring that the frequency count for the terms in the url is updated and so on. 


*Performance*: The throughput of various subsystems is described in the `"throughput"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json. I ran the tests on the small web graph (https://cs.brown.edu/courses/csci1380/sandbox/1). The tests appear to run faster in my dev environment than on the cloud.


## Wild Guess

> How many lines of code do you think it will take to build the fully distributed, scalable version of your search engine? Add that number to the `"dloc"` portion of package.json, and justify your answer below.
I believe that it would be around a thousand lines of code because the main implementation we are now missing involves the communication between nodes and building some sort of redundancy. I belive this can be covered efficiently in rougly 600 more lines of code.