'use strict';

const $ = window.jQuery;

// A row will be processed every DELAY ms and actions will wait until
// OPEN_CLOSE_DELAY
const DELAY = 400;
const OPEN_CLOSE_DELAY = 20;

// A map of selectors of DOM elements within a row
const SELECTORS = {
  header: 'form.search .inline-inputs',
  private: '[name=private]',
  edit: '.quick-edit',
  cancel: '.cancel',
  save: '[type=submit]',
  row: '.training-activity-row'
};

// A helper for finding a selector inside a row
const find = ($row, selector) => $row.find(SELECTORS[selector]);

// A map of predefined actions
const ACTIONS = {
  public: {
    condition ($row) {
      return find($row, 'private').is(':checked');
    },
    action ($row) {
      return find($row, 'private').prop('checked', false);
    }
  },
  private: {
    condition ($row) {
      return !find($row, 'private').is(':checked');
    },
    action ($row) {
      return find($row, 'private').prop('checked', true);
    }
  }
};

const editAll = (option) => {
  if (!option) {
    return new Error('You must specify an action.');
  }

  if (typeof option === 'string' && !ACTIONS[option]) {
    return new Error(`${option} is not a valid action.`);
  }

  // By default run the action for all rows if no condition is specified
  let condition = () => true;
  // By default there is no action
  let action = () => void 0;

  // Get action and condition from passed in option
  // This can be a string, action function, or object with a condition+action fns
  if (typeof option === 'string') {
    action = ACTIONS[option].action || action;
    condition = ACTIONS[option].condition || condition;
  }
  else if (typeof option === 'function') {
    action = option;
  }
  else if (typeof option === 'object') {
    action = option.action || action;
    condition = option.condition || condition;
  }

  // Star the first timeout on the next tick
  let time = 1;
  // Keep track of all timeouts so we can cancel later
  const timeouts = [];

  $(SELECTORS.row).each((i, row) => {
    let edited = false;
    const $row = $(row);
    const times = {
      start: time,
      action: time + OPEN_CLOSE_DELAY,
      close: time + (DELAY - OPEN_CLOSE_DELAY)
    };

    timeouts.push(
      setTimeout(() => find($row, 'edit').click(), times.start),
      setTimeout(() => {
        if (condition($row)) {
          action($row);
          edited = true;
        }
      }, times.action),
      setTimeout(() => find($row, edited ? 'save' : 'cancel').click(), times.close)
    );

    time += DELAY;
  });

  return () => timeouts.forEach(clearTimeout);
};

const attach = () => {
  const id = `${PLUGIN_NAME}__activities_edit_all`;
  const options = Object.keys(ACTIONS).map((key) => `<option value='${key}'>${key}</option>`);
  const $select = $(`<select id='${id}'><option>Edit All</option>${options}</select>`);

  $select.on('change', (e) => {
    e.preventDefault();
    const val = $select.val();
    if (val) {
      editAll(val);
      $select.val('');
    }
  });

  $(SELECTORS.header).find(`#${id}`).remove();
  $(SELECTORS.header).append($select);
};

export default {
  pathname: '/athlete/training',
  action: editAll,
  attach
};
