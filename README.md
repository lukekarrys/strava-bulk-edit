strava-enhancer
========================


## Installation

Currently the only way to use this is to load it in the console of Strava.com. This must be done after any page changing navigation since a browser reload will clear any external scripts.

This is just a quick WIP for now, in the future there will be a better installation process, if I deem this useful enough.

```js
> jQuery.getScript('https://npmcdn.com/strava-enhancer')
```


## Usage

Loading the script will do the following:

- Create `window.StravaEnhancer` containing all the api methods
- Attach any necessary DOM elements to the current page

Most enhancements will have some DOM elements added for basic tasks, and will also have more complex functionality availability on `window.stravaEnhancer.API_METHOD_NAME`.

Currently, only the pages below are supported. If you have a suggestion for something else this could do, please open an issue :).


## Enhancements

### Training Page

On the training page, it will add a dropdown to edit all currently visible activities to either public or private.

![](https://cldup.com/Nw5gUdqMmN.png)

#### API

```js
StravaEnhancer.editAll({
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
