import * as React from 'react';
import { Callout } from './Callout';
import { DirectionalHint } from '../../common/DirectionalHint';
import { IPositionProps } from '../../utilities/positioning';

export interface ICalloutProps extends React.Props<Callout>, IPositionProps {
  /**
   * Element to anchor the callout to.
   */
  targetElement?: HTMLElement;

  /**
   * Indicator of how the callout should be anchored to its targetElement.
   * @default DirectionalHint.rightCenter
   */
  directionalHint?: DirectionalHint;

  /**
   * The gap space between the target element and the callout.
   * @default 20
   */
  gapSpace?: number;

  /**
   * The css className for the beak.
   * @default 'ms-Callout-beak'
   */
  beakStyle?: string;

  /**
   * The beak width of the selected beakStyle.
   * @default 28
   */
  beakWidth?: number;

  /**
   * Weather the beak should be visible.
   * @default true
   */
  isBeakVisible?: boolean;

  /**
   * CSS class to apply to the callout.
   * @default null
   */
  className?: string;

  /**
   * Optional callback when the layer content has mounted.
   */
  onLayerMounted?: () => void;

  /**
   * Callback when the Callout tries to close.
   */
  onDismiss?: (ev?: any) => void;
}

export interface ILink {
  /**
   * Text to render for the link.
   */
  name: string;

  /**
   * URL for the link.
   */
  url: string;
}
