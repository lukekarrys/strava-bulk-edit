strava-bulk-edit
========================

_2020-06-02 Update: This is now possible [directly in Strava](https://support.strava.com/hc/en-us/articles/360034390012)._

_2019-04-22 Update: The public/private dropdown is working again._

[![Build Status](https://travis-ci.org/lukekarrys/strava-bulk-edit.png?branch=master)](https://travis-ci.org/lukekarrys/strava-bulk-edit)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)


## What is this?

I really wanted bulk editing for my 224 Strava activities so I could make them all public. It started as simple script I wrote in the browser console and ended up as this.


## Installation

Currently the only way to use this is to load it in the console of Strava.com. This must be done after any page changing navigation since a browser reload will clear any external scripts.

This is just a quick WIP for now, in the future there will be a better installation process, if I deem this useful enough.

```js
jQuery.getScript('https://unpkg.com/strava-bulk-edit/dist/StravaBulkEdit.js')
```


## Usage

Loading the script will do the following:

- Create `window.StravaBulkEdit` containing the API methods
- Attach any necessary DOM elements to the current page

### Training Page Bulk Editing

On the training page, it will add a dropdown to edit all activities to either public or private. It will do this by iterating over each one on the current page, and when it reaches the end of the page, navigating to the next page and starting over. It will also add a Cancel button while it's happening to abort any remaming activities.

![](https://cldup.com/7pZH0ZPSnR.gif)

Or you can use the API to edit any part of the row using some JS in the console.

```js
// $row is always is a jQuery object
StravaBulkEdit.editAll({
  // Run the action that you want to perform on each activity row
  action: function ($row) {
    // e.g. Set the description of each row to "Big climb!"
    $row.find('[name=description]').val('Big climb!');
  },
  // Optionally, only run the action on certain rows, by default, the action will
  // run for all rows. Return true or false from this to determine if the activity
  // row should have the action peformed on it.
  condition: function ($row) {
    // e.g. Only set the description if the elevation is more than 1000
    var elevation = $row.find('li:contains(Elevation)').text().replace(/\D/g, '');
    return parseInt(elevation, 10) > 1000;
  }
})
```

### Training Log Totals

On the training log page, it will add a button above the months nav which will auto-click through all the months to load the available data. After that, it will log an array of all available weeks with data for `elevation`, `miles`, and `time`. Note that this info will be available in the JS console.

Each time you run this it will save the latest fetched data to `localStorage` and use that as the earliest date next time.

![](https://cldup.com/oQEK1ub90q.png)

Or you can use the JS API:

```js
StravaBulkEdit.totalActivityLog({
  // Optional week interval to set as the earliest week to get data for
  // If left out, will use the value from the last run from localStorage
  earliestInterval: '2017y21w'
})
// Output
//  [{"interval":"2017y30w","week":30,"year":2017,"miles":19.7,"time":199,"elevation":2096}, ...]
//  Found 10 weeks from 2017y21w to 2017y30w
```

_So this method doesn't have anything to do with bulk editing, but I figured I'd add it to this package. I might get around to changing the name of this package later, but probably not._

## Disclaimer

This is in not affiliated with Strava, Inc. in any way. The term STRAVA and the Strava logo are the exclusive trademarks of, and are owned by, Strava Inc.

## LICENSE

MIT
