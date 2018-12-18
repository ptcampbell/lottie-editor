/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-shadow */
import React, { Component } from 'react';

import { diffTrimmedLines as diff } from 'diff';
import { hexToRgb } from 'color-invert';
import { TwitterPicker as Picker } from 'react-color';

import CircularProgress from '@material-ui/core/CircularProgress';
import Dropzone from 'react-dropzone';
import log from 'log-with-style';
import Snack from '@material-ui/core/Snackbar';

import colors from '../configs/colors';
import getColors from '../configs/algorithm';

import { download, toUnitVector } from '../configs/utils';

import Btn from './Btn';
import ErrorView from './ErrorView';
import Icon from './Icon';
import Lottie from './Lottie';

export default class extends Component {
  state = {
    err: false,
    json: '',
    jsonName: '',
    loading: false,
    picker: false,
    presetColors: Object.values(colors),
    rows: [],
    selectedRow: -1,
    snack: false,
    snackMessage: '',
    showLayerNames: false
  };

  componentWillMount() {
    const url = (window.location.href.split('src=')[1] || '').split('&')[0];
    if (url) this.fetchUrl(url, 'animation.json');
  }

  original = '';

  fetchUrl = (url, fileName) =>
    this.setState({ json: '', err: '', loading: true }, () =>
      fetch(url)
        .then(res => res.json())
        .then(json => this.parse(JSON.stringify(json), fileName))
        .catch(err =>
          this.setState({
            err: true,
            loading: false,
            snack: true,
            snackMessage: err.message
          })
        )
    );

  hidePicker = () => this.setState({ picker: false });

  assignAddAnimation = ref => (this.addAnimation = ref);

  pickColor = (color: Object) => {
    const { rows, selectedRow, json } = this.state;

    const newColor = color.hex;

    const newRows = rows;
    newRows[selectedRow].color = newColor;

    const duplicateColors = [];
    newRows.forEach((item, colorKey) => {
      if (item.nm === newRows[selectedRow].nm) {
        item.color = newColor;
        duplicateColors.push(colorKey);
      }
    });

    this.setState({ rows: newRows });

    const newJson = JSON.parse(json);

    const { r, g, b } = hexToRgb(newColor);

    duplicateColors.forEach((item) => {
      const { i, j, k, a, asset } = rows[item];
      if (asset === -1) {
        if (newJson && newJson.layers) {
          newJson.layers[i].shapes[j].it[k].c.k = [
            toUnitVector(r),
            toUnitVector(g),
            toUnitVector(b),
            a
          ];
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (newJson && newJson.assets) {
          newJson.assets[i].layers[item].shapes[j].it[k].c.k = [
            toUnitVector(r),
            toUnitVector(g),
            toUnitVector(b),
            a
          ];
        }
      }
    });
    this.setState({ json: JSON.stringify(newJson) });
  };

  pushColor = () => {
    const { presetColors, rows, selectedRow } = this.state;
    const { color } = rows[selectedRow];

    this.setState({ presetColors: presetColors.concat(color) });

    if (this.addAnimation && this.addAnimation.ref) {
      const animation = this.addAnimation.ref;
      animation.setSpeed(3);
      animation.play();
      animation.addEventListener('complete', () =>
        setTimeout(() => animation.goToAndStop(0), 500)
      );
    }
  };

  upload = files => {
    if (files[0]) {
      this.setState({ loading: true });
      const reader = new FileReader();
      reader.onload = e => this.parse(e.target.result, files[0].name);
      reader.readAsText(files[0]);
    }
  };

  parse = (source, fileName) => {
    this.original = source;

    this.setState({ json: source, picker: false, rows: [] }, () => {
      const rows = [];

      let { json } = this.state;
      json = JSON.parse(json);

      let jsonName = fileName.slice(0, -5);
      jsonName += `-w${json.w}-h${json.h}.json`;

      if (json && json.layers) {
        getColors(json.layers, color => rows.push(color));
      }

      if (json && json.assets) {
        json.assets.forEach((asset, i) =>
          getColors(asset.layers, color => rows.push(color), i)
        );
      }

      setTimeout(() => this.setState({ rows, jsonName, loading: false }), 500);
    });
  };

  export = () => {
    const { json, jsonName } = this.state;

    download(json, jsonName);

    setTimeout(() => this.showSnack('Diff is available in the console.'), 500);

    log('Computing diff ..');

    let additions = 0;
    let deletions = 0;

    const original = JSON.stringify(JSON.parse(this.original), null, 2);
    const parsed = JSON.stringify(JSON.parse(json), null, 2);

    diff(original, parsed, {
      newlineIsToken: true
    }).forEach(part => {
      const { added, removed, value } = part;

      const color = added ? 'green' : removed ? 'red' : null;

      if (color) log(`[c="color: ${color};"]${added ? '+' : '-'} ${value}[c]`);

      if (added) additions += value.length;
      else if (removed) deletions += value.length;
    });

    log(
      `[c="color: green;"]${additions} additions[c], [c="color: red;"]${deletions} deletions[c].`
    );
  };

  showSnack = snackMessage => this.setState({ snack: true, snackMessage });

  closeSnack = () => this.setState({ snack: false });

  toggleNames = () =>
    this.setState(state => ({ showLayerNames: !state.showLayerNames }));

  toggleGroups = () =>
    this.setState(state => ({ groupDuplicates: !state.groupDuplicates }));

  render() {
    const {
      err,
      json,
      loading,
      picker,
      presetColors,
      showLayerNames,
      rows,
      selectedRow,
      snack,
      snackMessage
    } = this.state;

    const Animation = () =>
      json && (
        <div className="animation">
          <Lottie
            fallback={<ErrorView color={colors.gray} />}
            src={JSON.parse(json)}
          />
        </div>
      );

    const { color } = (rows && rows[selectedRow]) || {};

    const Swatch = props => {
        // eslint-disable-next-line react/prop-types
        const { color, nm, i } = props;
        return (
            <div
              className="swatch"
              onClick={() =>
                this.setState({
                  picker: !picker,
                  selectedRow: i
                })
            }>
              <div className="color" style={{ backgroundColor: color }} />
              <div className="label">
                <p>{nm}</p>
                <p>{color}</p>
              </div>
            </div>
        );
    };

    const Palette = props => {
        const { rows } = props;
        return (
            <div className="palette">
                {rows.map((item, index) => <Swatch {...item} key={index} />)}
            </div>
        );
    };

    return (
      <div className="app-wrapper">
        {json && !loading ? (
          <div className="canvas">
            <Animation />
          </div>
        ) : (
        <div className="dropzone">
          <Dropzone
            accept="application/json"
            multiple={false}
            onDrop={this.upload}
          >
            {loading && (
              <CircularProgress />
            )}
            {!loading && (
              <div>
                {err ? (
                  <ErrorView />
                ) : (
                  <div className="upload">
                    <Icon
                      name="FileUpload"
                      size={128}
                    />
                    <h3>Drag and drop your JSON</h3>
                  </div>
                )}
              </div>
            )}
          </Dropzone>
        </div>
        )}
        {!loading &&
          json && (
            <div className="right-panel">
              {picker && (
                <div>
                  <div // eslint-disable-line
                    onClick={this.hidePicker}
                    className="picker-cover"
                  />
                  <Picker
                    color={color}
                    disableAlpha
                    onChange={this.pickColor}
                    presetColors={presetColors}
                  />
                </div>
              )}
              <Palette
                rows={rows}
                picker={picker}
                showLayerNames={showLayerNames}
              />
              <div className="options">
                  <Btn
                    color="primary"
                    variant="raised"
                    onClick={this.toggleNames}
                  >
                    <Icon name="Layers" />
                  </Btn>
              </div>
              <div className="export">
                <Btn color="primary" variant="raised" onClick={this.export}>
                    <Icon name="FileDownload" />
                </Btn>
              </div>
            </div>
          )}
        <Snack
          autoHideDuration={4000}
          message={snackMessage}
          open={snack}
        />
      </div>
    );
  }
}
