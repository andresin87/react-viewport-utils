import * as React from 'react';
import { ObserveBoundingClientRect } from '../lib/index';
import { connect as connectStickyGroup } from './StickyGroup';

interface IProps {
  children?: React.ReactNode;
  container?: React.RefObject<any>;
  stickyOffset: number;
}

interface IState {
  initRect: {
    height: number;
    width: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const baseStyles: React.CSSProperties = {
  willChange: 'position, top',
  position: 'static',
  top: 'auto',
  width: '100%',
};

class Sticky extends React.PureComponent<IProps, IState> {
  private stickyRef: React.RefObject<any>;
  private placeholderRef: React.RefObject<any>;
  static defaultProps = {
    stickyOffset: 0,
  };

  constructor(props) {
    super(props);

    this.stickyRef = React.createRef();
    this.placeholderRef = React.createRef();

    this.state = {
      initRect: {
        height: null,
        width: null,
        top: null,
        left: null,
        right: null,
        bottom: null,
      },
    };
  }

  hasContainer = () => {
    return Boolean(this.props.container);
  };

  isSticky = (rect, containerRect) => {
    if (!this.hasContainer()) {
      return containerRect.top <= this.props.stickyOffset;
    }

    if (containerRect.top > this.props.stickyOffset) {
      return false;
    }

    if (containerRect.bottom - this.props.stickyOffset < rect.height) {
      return false;
    }

    return true;
  };

  calcPositionStyles = (rect, containerRect): React.CSSProperties => {
    if (this.isSticky(rect, containerRect)) {
      return {
        position: 'fixed',
        top: 0,
      };
    }

    if (
      this.hasContainer() &&
      containerRect.bottom - this.props.stickyOffset < rect.height
    ) {
      return {
        position: 'absolute',
        top: containerRect.height - rect.height,
      };
    }

    return {
      position: 'absolute',
      top: 0,
    };
  };

  getStickyStyles(rect, containerRect): React.CSSProperties {
    if (!rect || !containerRect) {
      return null;
    }

    const offset = this.props.stickyOffset;
    const isSticky = this.isSticky(rect, containerRect);
    const transform = `
      translateZ(0)
      translateY(${isSticky ? offset : 0}px)
    `;
    return {
      transform,
      ...baseStyles,
      ...this.calcPositionStyles(rect, containerRect),
    };
  }

  getPlaceholderStyles(): React.CSSProperties {
    const { height = 'auto', width = 'auto' } = this.state.initRect;
    return {
      position: 'relative',
      height,
      width,
    };
  }

  setInitials = rect => {
    this.setState({
      initRect: rect,
    });
  };

  renderSticky(rect, containerRect) {
    return (
      <div
        ref={this.stickyRef}
        style={this.getStickyStyles(rect, containerRect)}
      >
        {this.props.children}
      </div>
    );
  }

  render() {
    const { container } = this.props;
    return (
      <div ref={this.placeholderRef} style={this.getPlaceholderStyles()}>
        <ObserveBoundingClientRect node={container || this.placeholderRef}>
          {containerRect => (
            <ObserveBoundingClientRect
              node={this.stickyRef}
              setInitials={this.setInitials}
            >
              {rect => this.renderSticky(rect, containerRect)}
            </ObserveBoundingClientRect>
          )}
        </ObserveBoundingClientRect>
      </div>
    );
  }
}

export default connectStickyGroup()(Sticky);
