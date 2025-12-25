const React = require('react');

const Svg = ({ children, ...props }: any) =>
  React.createElement('Svg', props, children);

const Path = (props: any) => React.createElement('Path', props);
const Rect = (props: any) => React.createElement('Rect', props);
const Circle = (props: any) => React.createElement('Circle', props);
const Line = (props: any) => React.createElement('Line', props);
const G = ({ children, ...props }: any) => React.createElement('G', props, children);

module.exports = {
  __esModule: true,
  default: Svg,
  Svg,
  Path,
  Rect,
  Circle,
  Line,
  G,
};

