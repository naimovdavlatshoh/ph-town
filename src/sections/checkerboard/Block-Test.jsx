import PropTypes from 'prop-types';

import './Block.css';

const Block = ({ number, text, color }) => (
  <div className={`block ${color}`}>
    <div className="block-number">{number}</div>
    <div className="block-text">{text}</div>
  </div>
);

Block.propTypes = {
  number: PropTypes.string,
  text: PropTypes.string,
  color: PropTypes.string,
};

export default Block;
