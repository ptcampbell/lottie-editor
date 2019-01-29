import React, { Component } from 'react';

import { uniqBy, difference } from 'lodash';
import { hexToRgb } from 'color-invert';
import { TwitterPicker as Picker } from 'react-color';

import CircularProgress from '@material-ui/core/CircularProgress';

import colors from '../configs/colors';
import getColors from '../configs/algorithm';

import { download, toUnitVector } from '../configs/utils';

import ErrorView from './ErrorView';
import Lottie from './Lottie';
import Browse from './Browse/Browse';

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
    showLayerNames: false
  };

  componentDidMount() {
    const divs = document.getElementsByClassName('swatch');
    const child_list = [];

    console.log(divs);

    for (let i = 0; i < divs.length; i++) {
      if (divs[i].className.indexOf('swatch') > -1) {
        // eslint-disable-next-line prefer-destructuring
        const className = divs[i].className;
        // eslint-disable-next-line
        const number = parseInt(className.substr(className.indexOf('.') + 1, className.length));
        if (child_list.indexOf(number) > -1) {
          divs[i].style.display = 'none';
        } else {
          child_list.push(number);
        }
      }
    }
  }

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
        .catch(() =>
          this.setState({
            err: true,
            loading: false
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
  };

  toggleNames = () =>
    this.setState(state => ({ showLayerNames: !state.showLayerNames }));

  toggleGroups = () =>
    this.setState(state => ({ groupDuplicates: !state.groupDuplicates }));

  render() {
    const {
      // eslint-disable-next-line no-unused-vars
      err,
      json,
      loading,
      picker,
      presetColors,
      showLayerNames,
      rows,
      selectedRow
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

    const Swatch = props => {
        // eslint-disable-next-line react/prop-types
        const { color, nm, index } = props;
        const truncatedName = nm.replace(/^#/, '');
        const isActive = index === selectedRow;

        // eslint-disable-next-line no-undef
        return (
            <div
              className={`swatch index_${index} ${truncatedName}`}
              onClick={() =>
                this.setState({
                  picker: !picker,
                  selectedRow: index
                })
            }>
               {isActive &&
                picker && (
                  <div className="popover">
                    <div // eslint-disable-line
                      onClick={this.hidePicker}
                      className="picker-cover"
                    />
                    <Picker
                      color={color}
                      disableAlpha
                      onChange={this.pickColor}
                      presetColors={presetColors}
                      triangle="top-right"
                    />
                  </div>
              )}
              <div className="color" style={{ backgroundColor: color }} />
              <div className="label">
                <p>{truncatedName}</p>
                <p>{color}</p>
              </div>
            </div>
        );
    };

    const Palette = props => {
        const { rows } = props;
        const unique = uniqBy(rows, 'nm');
        const diff = difference(rows, unique);
        // const newY = concat(unique, diff);

        console.log('diff', diff);
        console.log('unique', unique);
        console.log('rows', rows);

        return (
            <div className="palette">
              {rows.map((item, index) => {
                uniqBy(rows, 'nm');
                return <Swatch {...item} key={index} index={index} />;
              })}
            </div>
        );
    };

    return (
      <div className="app-wrapper">
        {!json && <Browse />}
        {loading && (
            <div className="loading-animation">
              <CircularProgress />
            </div>
        )}
        {json && !loading && (
          <div className="canvas">
            <Animation />
          </div>
        )}
        {!loading &&
          json && (
            <div className="right-panel">
              <Palette
                rows={rows}
                picker={picker}
                showLayerNames={showLayerNames}
              />
              <div className="export">
                <button color="primary" variant="raised" onClick={this.export}>
                    Download JSON
                </button>
              </div>
            </div>
        )}
      </div>
    );
  }
}
