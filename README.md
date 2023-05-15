<h1 class="code-line" data-line-start=0 data-line-end=1 ><a id="Upshare_Server_0"></a>Upshare Server</h1>
<p class="has-line-data" data-line-start="2" data-line-end="3"><a href="https://nodesource.com/products/nsolid"><img src="https://cldup.com/dTxpPi9lDf.thumb.png" alt="N|Solid"></a></p>
<p class="has-line-data" data-line-start="4" data-line-end="5"><a href="https://travis-ci.org/joemccann/dillinger"><img src="https://travis-ci.org/joemccann/dillinger.svg?branch=master" alt="Build Status"></a></p>
<p class="has-line-data" data-line-start="6" data-line-end="7">Upshare is a website designed for users to share their thoughts and promote their content. This repository contains the server-side code for Upshare.</p>
<h2 class="code-line" data-line-start=8 data-line-end=9 ><a id="Technologies_Used_8"></a>Technologies Used</h2>
<p class="has-line-data" data-line-start="10" data-line-end="11">The Upshare server is built using Node.js and Express.js, and uses a MongoDB database to store user information and content. The server implements a RESTful API that allows users to create, read, update, and delete their posts.</p>
<p class="has-line-data" data-line-start="12" data-line-end="13">Upshare users a number of other technologies in the project:</p>
<ul>
<li class="has-line-data" data-line-start="14" data-line-end="15"><a href="https://mongoosejs.com/docs/">Mongoose.js</a>: an object modeling library for MongoDB.</li>
<li class="has-line-data" data-line-start="15" data-line-end="16"><a href="https://expressjs.com/en/resources/middleware/multer.html#:~:text=Multer%20is%20a%20node.,multipart%2Fform%2Ddata%20">Multer.js</a>: middleware for handling file uploads.</li>
<li class="has-line-data" data-line-start="16" data-line-end="18"><a href="https://helmetjs.github.io/">Helmet.js</a>: middleware for securing HTTP headers.</li>
</ul>
<h2 class="code-line" data-line-start=18 data-line-end=19 ><a id="Getting_Started_18"></a>Getting Started</h2>
<p class="has-line-data" data-line-start="20" data-line-end="21">Dillinger requires <a href="https://nodejs.org/">Node.js</a> v14+ to run.</p>
<p class="has-line-data" data-line-start="23" data-line-end="25">To get started with the Upshare server, follow these steps:<br>
Clone this repository to your local machine:</p>
<pre><code class="has-line-data" data-line-start="27" data-line-end="29" class="language-sh">git <span class="hljs-built_in">clone</span> https://github.com/Aniket-lodh/upshare-server.git
</code></pre>
<p class="has-line-data" data-line-start="30" data-line-end="31">Then, cd to cloned repo path, Install the dependencies by running npm i or npm install and start the server:</p>
<pre><code class="has-line-data" data-line-start="32" data-line-end="36" class="language-sh"><span class="hljs-built_in">cd</span> upshare-server
npm i
node dev
</code></pre>
<p class="has-line-data" data-line-start="37" data-line-end="38">Start the server by running npm dev. The server will be listening on 9000 if PORT is defined in .env file or by default it will run on PORT 2408. This should look like this:</p>
<pre><code class="has-line-data" data-line-start="39" data-line-end="41" class="language-sh">http://localhost:<span class="hljs-number">9000</span>. //with PORT defined
</code></pre>
<pre><code class="has-line-data" data-line-start="42" data-line-end="44" class="language-sh">http://localhost:<span class="hljs-number">2408</span> //without PORT
</code></pre>
<h2 class="code-line" data-line-start=45 data-line-end=46 ><a id="API_Documentation_45"></a>API Documentation</h2>
<p class="has-line-data" data-line-start="47" data-line-end="48">The Upshare server provides a REST API for interacting with user accounts and content. You can find the API documentation in the docs folder.</p>
<h2 class="code-line" data-line-start=49 data-line-end=50 ><a id="Contributing_49"></a>Contributing</h2>
<p class="has-line-data" data-line-start="51" data-line-end="52">Want to contribute? Great!</p>
<p class="has-line-data" data-line-start="53" data-line-end="54">Contributions to the Upshare project are welcome! If you’d like to contribute to the server-side code, please follow these steps:</p>
<blockquote>
<p class="has-line-data" data-line-start="55" data-line-end="59">1. Fork this repository to your own GitHub account<br>
2. Create a new branch for your changes<br>
3. Make your changes and test them thoroughly<br>
4. Submit a pull request back to this repository</p>
</blockquote>
<h2 class="code-line" data-line-start=60 data-line-end=61 ><a id="License_60"></a>License</h2>
<p class="has-line-data" data-line-start="62" data-line-end="63">MIT</p>
<p class="has-line-data" data-line-start="64" data-line-end="65"><strong>Free Software, Hell Yeah!</strong></p>
<p class="has-line-data" data-line-start="66" data-line-end="67">The Upshare server is open-source software released under the MIT License. See the LICENSE file for more information.</p>