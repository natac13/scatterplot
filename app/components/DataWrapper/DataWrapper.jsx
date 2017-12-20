import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import Scatterplot from 'Components/Scatterplot/';
import style from './style.scss';

export default class DataWrapper extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    actions: PropTypes.object,
  };

  constructor(props) {
    super(props);
    console.log(props)
    console.log(props.data)
    console.log(props.data.chartData)
    /** Styling */
    const wrapperClass = classnames({
      [style.wrapper]: true,
      [props.className]: !!props.className,
    });

    /** State Creation */
    this.state = {
      wrapperClass,
      chartData: props.data.chartData || [],
      width: 1200,
      height: 800,
      data: props.data,
      title: 'Cyclist Doping',
    };
  }


  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    const { chartData } = nextProps.data;
    if (chartData.length !== 0) {
      this.setState({
        chartData,
      });
    }

  }


  render() {
    const {
      wrapperClass,
      title,
      chartData,
      width,
      height,
    } = this.state;

    console.log(chartData)

    return (
      <section className={wrapperClass}>
        <h1 className={style.title}>{title}</h1>
        <Scatterplot
          chartData={chartData}
          width={width}
          height={height}
        />

      </section>
    );
  }

}
