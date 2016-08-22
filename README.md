# Serif: A Visual Shopping Cart for Northwestern University

## UPDATE: *This repository is now outdated*. Serif is currently being rebuilt from the ground up! Track the progress at [https://github.com/Joonpark13/serif](https://github.com/Joonpark13/serif)
Changes include: All new visual design done in Google's Material Design, rebuilt using Facebook's React, development using github workflow (including actually helpful commit messages, yay!), and more.

<br><br>

What is it?
------------------------------
Serif is a web application designed to be the ultimate preparation tool for student schedule preparation at Northwestern. Originally constructed to combat CAESAR's inability to view the shopping cart in a weekly view, Serif is continually being developed to add more features that will help the student experience.

Serif is not intended to replace CAESAR - the enrollment of courses still must be done in CAESAR itself, not to mention the myriad of other functionality that CAESAR contains that is not related to scheduling (billing, emergency contact, etc). However, Serif should compliment and greatly ease the use of CAESAR for course enrollment, as it will allow students to find courses quickly and easily, create and compare multiple schedules, and more.

If there is a feature that you would like to see added to Serif, or a functionality that you wish were different somehow, please send a note through the feedback form. This will help Serif become a better service for the students.

The application is written in python (serverside) and javascript (clientside). The <a href='http://flask.pocoo.org/'>flask</a> api is used alongside <a href='http://getbootstrap.com/'>bootstrap</a> among other common packages such as jQuery UI. The data is taken from the <a href='http://developer.asg.northwestern.edu/'>Northwestern Course Data API</a> and is saved to a postgresql database on the local development machine, which then generates static json files for upload to Amazon S3. Through AJAX requests, the data is downloaded and saved clientside using indexedDB for fast access and no server load.

The application takes advantage of localStorage in order to save user schedules locally.

Latest Version
------------------------------
V1.5
CHANGELOG:
<ul>
    <li>Added hover and drag functionality for section and component lists</li>
    <li>Fixed bug where sections without components would force you to choose a component</li>
    <li>Implemented indexeddb for clientside storage</li>
    <li>Made indexedDB cursors faster by specifying keyRanges</li>
    <li>Made every ajax reference a static file</li>
    <li>Works for indexedDB and no indexedDB</li>
</ul>

Author and Contact
------------------------------
Joon Park<br>
Junior, Northwestern University Class of '18<br>
B.A. Physics and B.M. Music Composition<br>
JoonPark2017@u.northwestern.edu<br>
<a href='http://joonparkmusic.com'>joonparkmusic.com</a>
