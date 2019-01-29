import React, { Component } from 'react';

import lottie from 'lottie-web/build/player/lottie.min';
import PropTypes from 'prop-types';

export default class Lottie extends Component {
  static propTypes = {
    config: PropTypes.object,
    src: PropTypes.object.isRequired,
    fallback: PropTypes.any,
    landing: PropTypes.bool,
    dimensions: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired
    })
  };

  static defaultProps = {
    config: {},
    fallback: undefined,
    landing: false,
    dimensions: undefined
  };

  state = { err: false };

  componentWillUnmount() {
    if (this.animation) this.ref.destroy();
  }

  play = wrapper => {
    const { config, src } = this.props;

    try {
      this.ref = lottie.loadAnimation({
        autoplay: true,
        loop: true,
        ...config,
        animationData: src,
        renderer: 'svg',
        wrapper
      });
    } catch (err) {
      this.setState({ err: true });
    }
  };

  render() {
    const { err } = this.state;

    const { fallback, landing, dimensions } = this.props;

    if (err) {
      if (!fallback) return null;

      if (landing) return <div>{fallback}</div>;

      return fallback;
    }

    const maxHeight = (dimensions && dimensions.height) || null;
    const width = (dimensions && dimensions.width) || null;

    const animation = (
      <div style={{ maxHeight, width }}>
        <div className="animationWrapper" ref={this.play} />
      </div>
    );

    if (landing) return <div>{animation}</div>;

    return animation;
  }
}
