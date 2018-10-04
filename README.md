# Challenge analysis

## TLDR;
**Client**: There was not much to do here; with a lack of access to the file `sender/index.js`, few improvements could have been done in `sender/transmit.js`.

**Server**: The root of the challenge was more in the client side, even if we could had scale the server multiple times, the amount of requests sent by the client would be always the same.


## Client improvements
The improvements performed were:

- Reusing the same `http.agent` for the http requests.
  - This small change would keep open the http connections as much as possible.

- Skipping http requests with empty body.
  - Reducing the amount of unnecessary requests to keep the bandwidth clear as possible.

There was a measure of time using the acceptance test and `console.time()`

2 different sets of tests:

1. With the delay at `sender/index.js`
2. Without the delay at `sender/index.js`

With different configurations:
* A - No modification at all
* B - KeepAliveAgent, no gzip, one server
* C - KeepAliveAgent, gzip, one server
* D - KeepAliveAgent, gzip, cluster servers (4)

| Configurations | Test 1     | Test 2     | Test 3 (no-delay) | Test 4 (no-delay) |
| -------------- | ---------- | ---------- | ----------------- | ----------------- |
| A              | 139434.357 | 153943.531 | 3490.944          | 3506.604          |
| B              | 155486.863 | 147481.407 | 482.991           | 503.987           |
| C              | 153986.301 | 142152.639 | 490.604           | 515.217           |
| D              | 152597.001 | 149361.255 | 446.04            | 448.725           |

In a more easy way to digest the information:
Performing the tests with the **random** delay shows completely opposite results with the different configurations.

| Test1                                    | Test2                                    |
| ---------------------------------------- | ---------------------------------------- |
| ![Test1](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/Test%201.png) | ![Test2](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/Test%202.png) |

![Test1 and Test2](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/Test%201%20and%20Test%202.png)

Completely opposite results; Can't get stable information about it.

In the tests without delay (or with a constant bandwidth limit), we can see clearly the performance boost wins from **reusing** the `http.agent`. And not much from using `gzip` (even adding a small amount of time).
| Test3                                    | Test4                                    |
| ---------------------------------------- | ---------------------------------------- |
| ![Test3](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/Test%203%20(no-delay).png) | ![Test4](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/Test%204%20(no-delay).png) |

![Test3 and Test4](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/Test%203%20and%20Test%204.png)

Both of the tests (no-delay) where consistent with their results.
Also is worth to mention that the use of a cluster solution for the server (4 instances of the webserver) would not improve our bandwidth issue; But will allow us to perceive more requests per second.

### Another client performance tests.
From a lecture in a [blog](https://engineering.gosquared.com/optimise-node-http-server), where it states that declaring the size of the request body could reduce the amount of data sent. This would work if our body consisted on `strings`, but because our payload was a combination of `{}` and `[]`, the process of `stringify` added an overhead of data.

Here the results:

![bodyLength](https://github.com/eduardosanzb/receiver-sender-challenge/raw/master/charts/with%20normal%20and%20with%20length%20(10%20requests).png)

### Conclusion

Few performance improvements beyond keeping an active connection to the server could be performed.

The real bottleneck in the client is a **random delay** `setTimeout` added in a stream, so the queue was under-performing out of the scope of the implementation.

The implementation of a more sophisticated compression algorithm in the body of the request could only gain few improvements and increase the maintainability of the project (e.g. JSONC).



## Server

Again, the real performance bottleneck was underlying in the client side. Nevertheless the server could be improved for scalability and maintainability reasons.



The first thing to be done was to decouple the web server logic to a different file with a proper unit test. The creation of a subdirectory `server/` was needed.

Here we have two files:

* `server/index.js`: The implementation of a web server specifically for this solution.
* `server/test.js`: The unit test for the web server.

The **two** real performance improvements for the server were:

1. Block or ignore any request that were not type `POST`
2. Ignore all the requests outside of the provided namespace `/end`



Another potential performance tweak could be to `console.log` on each `.on('data')` event in the request. Because there was no reason to concat all the bytes in memory.

```javascript
...
request
	.on('data', (data) => { console.log(data.toString()) })
	.on('end', this._sendResponse.bind(this))
	...
```



The use of a `class` was based on a more easy to read the file.

Now with the decoupling of the `Server` logic, in case of needing to scale our web application with multiples instances, we could easily use an approach with the `cluster` module. (Like in `startClusterSolution()`)

Other nice win of decoupling the `Server` was the enabling of unit testing our web server. Simple tests like having correct responses when doing a `GET` request.

### Conclusion

I think the challenge in the server was to deliver a more maintainable and scalable solution. A lot of assumptions were made (e.g. Only allowing POST request). 
