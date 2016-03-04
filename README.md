# Prsnl
Manage the people in your life.

<img src="readme_imgs/prsnl-ui.png"/>

##Why

Because you're a hard working individual and it is challenging to maintain relationships with every single client of your business.

Prsnl is an app that aims to make you more cognizant of your relationships.  It does this by reminding you to contact people (at a specified interval) and assigns points to interactions you have with people. Over time your points decay, suggesting that your relationship with that person is becoming weaker.  The only way to increase points is to log an interaction.  This allows you to visualize your communication with people.

##Using the App

###Adding Client
When you create an account, you will start with a blank profile.  The first thing you need to do is add some clients to your account.  These are people you would like to keep in touch with.  You can add client by clicking on the plus icon located on the left side.

For each of your business client, you specify some contact info (optional) and a contact frequency.  This is the number of days you would like Prnsl to remind you to contact that particular person.  From the contact frequency, the  'next interaction date' will be set, which serves as a reminder of when to contact that person again.

Once a client is successfully added, they will appear in your family list (see picture below).

<img src="readme_imgs/family-view.png"/>

###Adding Interactions
By clicking on the arrow next to each client, an action pane opens and you can select an action, add some notes about that interaction, and save it (see picture below).  

<img src="readme_imgs/action-view.png"/>

Each interaction has an assigned point value.  A small interaction such as a text message, will not earn as much points as a large interaction, such as sharing a meal together.  

Once saved, you should see the graphs update and the note appear in the notes list.  Also, if your action is within 5 days of your next interaction date, then that person will be assigned a new interaction date, according to the contact frequency that you specified for that person.

###Points Graph
When you add interactions with people, you earn points for that person. Over time, each client will lose points.  This is to signify that relationships require communication, and will deteriorate if communication is not maintained.  So be sure to log tasks to keep that relationship at a healthy level!

Below is a screenshot of an example. You can see that on January 9th, that person had coffee with Bianca and earned 10 points.  But those 10 points lost value each day, until on Jan 19 that person sent Bianca a letter and earned 6 points.

![summary-view](https://github.com/Courageous-Climbers/GaussHyrax/blob/master/readme_imgs/summary-view.png?raw=true)

##Deploying Your Own Prnsl Server

###Setup
Prnsl is a MEAN application, so you need to have node.js installed.  Then, download the above repo and run

```npm install``` 

from the root directory to download all required dependencies.  You need to configure a MongoDB connection in server/db.js.  After that, run 

```node server/server.js```

and the server should be up and running.

###API
Please consult server/db.js for all the API specifications.
