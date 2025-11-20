declare module 'react-plotly.js' {
  import { Component } from 'react';
  import { PlotParams } from 'plotly.js';

  export interface PlotProps extends Partial<PlotParams> {
    data: Partial<PlotParams['data']>;
    layout?: Partial<PlotParams['layout']>;
    config?: Partial<PlotParams['config']>;
    frames?: Partial<PlotParams['frames']>;
    onInitialized?: (figure: Readonly<any>, graphDiv: Readonly<HTMLElement>) => void;
    onUpdate?: (figure: Readonly<any>, graphDiv: Readonly<HTMLElement>) => void;
    onPurge?: (figure: Readonly<any>, graphDiv: Readonly<HTMLElement>) => void;
    onError?: (err: Readonly<Error>) => void;
    onClickAnnotation?: (event: Readonly<any>) => void;
    onAfterExport?: () => void;
    onAfterPlot?: () => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: Readonly<any>) => void;
    onAnimationInterrupted?: () => void;
    onAutoSize?: () => void;
    onBeforeExport?: () => void;
    onButtonClicked?: (event: Readonly<any>) => void;
    onClick?: (event: Readonly<any>) => void;
    onClickAnnotation?: (event: Readonly<any>) => void;
    onDeselect?: () => void;
    onDoubleClick?: () => void;
    onFramework?: () => void;
    onHover?: (event: Readonly<any>) => void;
    onLegendClick?: (event: Readonly<any>) => boolean;
    onLegendDoubleClick?: (event: Readonly<any>) => boolean;
    onRelayout?: (event: Readonly<any>) => void;
    onRestyle?: (event: Readonly<any>) => void;
    onRedraw?: () => void;
    onSelected?: (event: Readonly<any>) => void;
    onSelecting?: (event: Readonly<any>) => void;
    onSliderChange?: (event: Readonly<any>) => void;
    onSliderEnd?: (event: Readonly<any>) => void;
    onSliderStart?: (event: Readonly<any>) => void;
    onSunburstClick?: (event: Readonly<any>) => void;
    onTransitioning?: () => void;
    onTransitionInterrupted?: () => void;
    onUnhover?: (event: Readonly<any>) => void;
    onWebGlContextLost?: () => void;
    divId?: string;
    className?: string;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    debug?: boolean;
    revision?: number;
  }

  export default class Plot extends Component<PlotProps> {}
}

