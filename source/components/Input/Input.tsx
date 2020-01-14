import * as React from 'react';
import * as PropTypes from 'prop-types';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import omit from 'omit.js';
import Group from './Group';
import Search from './Search';
import TextArea from './TextArea';
import Counter from './Counter';
import { Omit } from '../../utils/type';
import Icon from '../Icon';
function fixControlledValue<T>(value: T) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return value;
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  prefixCls?: string;
  className?: string;
  size?: 'large' | 'default' | 'small';
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
}

class Input extends React.Component<InputProps, any> {
  static Group: typeof Group;
  static Search: typeof Search;
  static TextArea: typeof TextArea;
  static Counter: typeof Counter;

  static defaultProps = {
    prefixCls: 'fishd-input',
    type: 'text',
    disabled: false,
  };

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    size: PropTypes.oneOf(['small', 'default', 'large']),
    maxLength: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    disabled: PropTypes.bool,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    className: PropTypes.string,
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    prefixCls: PropTypes.string,
    autosize: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    onPressEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    allowClear: PropTypes.bool,
  };
  
  static getDerivedStateFromProps(nextProps: InputProps) {
    if ('value' in nextProps) {
      return {
        value: nextProps.value,
      };
    }
    return null;
  }

  input: HTMLInputElement;

  constructor(props: InputProps) {
    super(props);
    const value = typeof props.value === 'undefined' ? props.defaultValue : props.value;
    this.state = {
      value,
    };
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { onPressEnter, onKeyDown } = this.props;
    if (e.keyCode === 13 && onPressEnter) {
      onPressEnter(e);
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  getInputClassName() {
    const { prefixCls, size, disabled } = this.props;
    return classNames(prefixCls, {
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-disabled`]: disabled,
    });
  }

  saveInput = (node: HTMLInputElement) => {
    this.input = node;
  }
  setValue(
    value: string,
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLElement>,
    callback?: () => void,
  ) {
    if (!('value' in this.props)) {
      this.setState({ value }, callback);
    }
    const { onChange } = this.props;
    if (onChange) {
      let event = e;
      if (e.type === 'click') {
        // click clear icon
        event = Object.create(e);
        event.target = this.input;
        event.currentTarget = this.input;
        const originalInputValue = this.input.value;
        // change input value cause e.target.value should be '' when clear input
        this.input.value = '';
        onChange(event as React.ChangeEvent<HTMLInputElement>);
        // reset input value
        this.input.value = originalInputValue;
        return;
      }
      onChange(event as React.ChangeEvent<HTMLInputElement>);
    }
  }

  handleReset = (e: React.MouseEvent<HTMLElement>) => {
    this.setValue('', e, () => {
      this.focus();
    });
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setValue(e.target.value, e);
  };

  renderClearIcon() {
    const { allowClear, prefixCls, disabled} = this.props;
    const { value } = this.state;
    if (!allowClear || disabled || value === undefined || value === null ||value === '') {
      return null;
    }
    return (
      <Icon
        type="close-circle-fill"
        onClick={this.handleReset}
        className={`${prefixCls}-clear-icon`}
      />
    );
  }

  renderSuffix() {
    const { suffix, allowClear, prefixCls } = this.props;
    if (suffix || allowClear) {
      return (
        <span className={`${prefixCls}-suffix`}>
          {this.renderClearIcon()}
          {suffix}
        </span>
      );
    }
    return null;
  }

  renderLabeledInput(children: React.ReactElement<any>) {
    const props = this.props;
    // Not wrap when there is not addons
    if ((!props.addonBefore && !props.addonAfter)) {
      return children;
    }

    const wrapperClassName = `${props.prefixCls}-group`;
    const addonClassName = `${wrapperClassName}-addon`;
    const addonBefore = props.addonBefore ? (
      <span className={addonClassName}>
        {props.addonBefore}
      </span>
    ) : null;

    const addonAfter = props.addonAfter ? (
      <span className={addonClassName}>
        {props.addonAfter}
      </span>
    ) : null;

    const className = classNames(`${props.prefixCls}-wrapper`, {
      [wrapperClassName]: (addonBefore || addonAfter),
    });

    const groupClassName = classNames(`${props.prefixCls}-group-wrapper`, {
      [`${props.prefixCls}-group-wrapper-sm`]: props.size === 'small',
      [`${props.prefixCls}-group-wrapper-lg`]: props.size === 'large',
    });

    // Need another wrapper for changing display:table to display:inline-block
    // and put style prop in wrapper
    if (addonBefore || addonAfter) {
      return (
        <span
          className={groupClassName}
          style={props.style}
        >
          <span className={className}>
            {addonBefore}
            {React.cloneElement(children, { style: null })}
            {addonAfter}
          </span>
        </span>
      );
    }
    return (
      <span className={className}>
        {addonBefore}
        {children}
        {addonAfter}
      </span>
    );
  }

  renderLabeledIcon(children: React.ReactElement<any>) {
    const { props } = this;
    const suffix = this.renderSuffix();

    if (!('prefix' in props) && !suffix) {
      return children;
    }

    const prefix = props.prefix ? (
      <span className={`${props.prefixCls}-prefix`}>
        {props.prefix}
      </span>
    ) : null;

    const affixWrapperCls = classNames(props.className, `${props.prefixCls}-affix-wrapper`, {
      [`${props.prefixCls}-affix-wrapper-sm`]: props.size === 'small',
      [`${props.prefixCls}-affix-wrapper-lg`]: props.size === 'large',
    });
    return (
      <span
        className={affixWrapperCls}
        style={props.style}
      >
        {prefix}
        {React.cloneElement(children, { style: null, className: this.getInputClassName() })}
        {suffix}
      </span>
    );
  }

  renderInput() {
    const { className} = this.props;
    const { value } = this.state;
    // Fix https://fb.me/react-unknown-prop
    const otherProps = omit(this.props, [
      'prefixCls',
      'onPressEnter',
      'addonBefore',
      'addonAfter',
      'prefix',
      'suffix',
      'allowClear',
      'defaultValue'
    ]);

    return this.renderLabeledIcon(
      <input
        {...otherProps}
        value={fixControlledValue(value)}
        onChange={this.handleChange}
        className={classNames(this.getInputClassName(), className)}
        onKeyDown={this.handleKeyDown}
        ref={this.saveInput}
      />,
    );
  }

  render() {
    return this.renderLabeledInput(this.renderInput());
  }
}

polyfill(Input);

export default Input;