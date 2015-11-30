strava-bulk-edit
========================

## What is this?

I really wanted bulk editing for my 224 Strava activities so I could make them all public. It started as simple script I wrote in the browser console and ended up as this.

This is in not affiliated with Strava, Inc in any way.


## Installation

Currently the only way to use this is to load it in the console of Strava.com. This must be done after any page changing navigation since a browser reload will clear any external scripts.

This is just a quick WIP for now, in the future there will be a better installation process, if I deem this useful enough.

```js
> jQuery.getScript('https://npmcdn.com/strava-enhancer')
```


## Usage

Loading the script will do the following:

- Create `window.StravaEnhancer` containing the API methods
- Attach any necessary DOM elements to the current page

### Training Page Bulk Editing

On the training page, it will add a dropdown to edit all currently visible activities to either public or private.

![](https://cldup.com/Nw5gUdqMmN.png)

Or you can use the API to edit any part of the row using some JS in the console.

```js
StravaEnhancer.editAll({
  // $row is a jQuery object
  action: function ($row) {
    // Run the action that you want to perform on each activity row
    $row.find('[name=description]').val('Adding notes here!')
  },
  // Optionally, only run the action on certain rows.
  condition: function ($row) {
    // Return true or false from this to determine if the activity row should
    // have the action peformed on it. This defaults to `true` for all rows.
  }
})
```

## LICENSE

MIT
