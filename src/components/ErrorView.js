import React from 'react';
import PropTypes from 'prop-types';

const ErrorView = ({ color }) => (
  <div>
    <p>Error</p>
  </div>
);

ErrorView.propTypes = {
  color: PropTypes.string.isRequired
};

export default ErrorView;
