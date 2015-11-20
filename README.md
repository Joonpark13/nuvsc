# Serif: A Visual Shopping Cart for Northwestern University

What is it?
------------------------------
Serif is a web application designed to be the ultimate preparation tool for student schedule preparation at Northwestern. Originally constructed to combat CAESAR's inability to view the shopping cart in a weekly view, Serif is continually being developed to add more features that will help the student experience.

Serif is not intended to replace CAESAR - the enrollment of courses still must be done in CAESAR itself, not to mention the myriad of other functionality that CAESAR contains that is not related to scheduling (billing, emergency contact, etc). However, Serif should compliment and greatly ease the use of CAESAR for course enrollment, as it will allow students to find courses quickly and easily, create and compare multiple schedules, and more.

If there is a feature that you would like to see added to Serif, or a functionality that you wish were different somehow, please send a note through the feedback form. This will help Serif become a better service for the students.

The application is written in python (serverside) and javascript (clientside). The <a href='http://flask.pocoo.org/'>flask</a> api is used alongside <a href='http://getbootstrap.com/'>bootstrap</a> among other common packages such as jQuery UI. The data is taken from the <a href='http://developer.asg.northwestern.edu/'>Northwestern Course Data API</a> and is saved to a postgresql database on the local development machine, which then generates static json files for upload. Through AJAX requests, the data is downloaded and saved clientside using indexedDB for fast access and no server load. If a browser does not support IndexedDB or has issues with the standard (as is in the case with Safari), then the javascript defaults back to querying the server for information.

The application takes advantage of localStorage in order to save user schedules locally.

Latest Version
------------------------------
V1.6
CHANGELOG:
<ul>
    <li>Added share button</li>
</ul>

Author and Contact
------------------------------
Joon Park<br>
Junior, Northwestern University Class of '18<br>
B.A. Physics and B.M. Music Composition<br>
JoonPark2017@u.northwestern.edu<br>
<a href='http://joonparkmusic.com'>joonparkmusic.com</a>
