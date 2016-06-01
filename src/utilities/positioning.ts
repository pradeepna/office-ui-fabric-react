import { DirectionalHint } from '../common/DirectionalHint';
import Rectangle from './Rectangle';
export enum RectangleEdge {
  top,
  bottom,
  left,
  right
}

let SLIDE_ANIMATIONS: { [key: number]: string; } = {
  [RectangleEdge.top]: 'slideUpIn20',
  [RectangleEdge.bottom]: 'slideDownIn20',
  [RectangleEdge.left]: 'slideLeftIn20',
  [RectangleEdge.right]: 'slideRightIn20'
};

export interface IPositionProps {
  targetElement?: HTMLElement;
  directionalHint?: DirectionalHint;
  gapSpace?: number;
  beakWidth?: number;
  /**
   * The bounding rectangle for which  the contextual menu can appear in.
   */
  bounds?: IRect;
  /**
   * The event that created the contextualmenu.
   * @default null
   */
  creationEvent?: MouseEvent;

  useTargetPoint?: boolean;

  targetPoint?: IPoint;

  isBeakVisible?: boolean;
}

export interface IPositionInfo {
  calloutPosition: {top: number, left: number};
  beakPosition: {top: number, left: number, display: string};
  directionalClassName: string;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

class PositionData {
  public calloutDirection: RectangleEdge;
  public targetDirection: RectangleEdge;
  public calloutPercent: number;
  public targetPercent: number;
  public isAuto: boolean;
  public beakPercent: number;

  constructor(calloutDirection: RectangleEdge, targetDirection: RectangleEdge, calloutPercent: number, targetPercent: number, beakPercent: number, isAuto: boolean) {
    this.calloutDirection = calloutDirection;
    this.targetDirection = targetDirection;
    this.calloutPercent = calloutPercent;
    this.targetPercent = targetPercent;
    this.isAuto = isAuto;
    this.beakPercent = beakPercent;
  }
}

// Currently the beakPercent is set to 50 for all positions meaning that it should tend to the center of the target
let DirectionalDictionary: { [key: number]: PositionData} = {
  [DirectionalHint.topLeftEdge]: new PositionData(RectangleEdge.bottom, RectangleEdge.top, 0, 0, 50, false),
  [DirectionalHint.topCenter]: new PositionData(RectangleEdge.bottom, RectangleEdge.top, 50, 50, 50, false),
  [DirectionalHint.topRightEdge]: new PositionData(RectangleEdge.bottom, RectangleEdge.top, 100, 100, 50, false),
  [DirectionalHint.topAutoEdge]: new PositionData(RectangleEdge.bottom, RectangleEdge.top, 0, 0, 50, true),
  [DirectionalHint.bottomLeftEdge]: new PositionData(RectangleEdge.top, RectangleEdge.bottom, 0, 0, 50, false),
  [DirectionalHint.bottomCenter]: new PositionData(RectangleEdge.top, RectangleEdge.bottom, 50, 50, 50, false),
  [DirectionalHint.bottomRightEdge]: new PositionData(RectangleEdge.top, RectangleEdge.bottom, 100, 100, 50, false),
  [DirectionalHint.bottomAutoEdge]: new PositionData(RectangleEdge.top, RectangleEdge.bottom, 0, 0, 50, true),
  [DirectionalHint.leftTopEdge]: new PositionData(RectangleEdge.right, RectangleEdge.left, 0, 0, 50, false),
  [DirectionalHint.leftCenter]: new PositionData(RectangleEdge.right, RectangleEdge.left, 50, 50, 50, false),
  [DirectionalHint.leftBottomEdge]: new PositionData(RectangleEdge.right, RectangleEdge.left, 100, 100, 50, false),
  [DirectionalHint.rightTopEdge]: new PositionData(RectangleEdge.left, RectangleEdge.right, 0, 0, 50, false),
  [DirectionalHint.rightCenter]: new PositionData(RectangleEdge.left, RectangleEdge.right, 50, 50, 50, false),
  [DirectionalHint.rightBottomEdge]: new PositionData(RectangleEdge.left, RectangleEdge.right, 100, 100, 50, false)
};
  export function getRelativePositions(
    props: IPositionProps,
    hostElement: HTMLElement,
    calloutElement: HTMLElement): IPositionInfo {
      let beakWidth = !props.isBeakVisible ? 0 : props.beakWidth;

      let gap = positioningFunctions._calculateActualBeakWidthInPixels(beakWidth) / 2 + (props.gapSpace ? props.gapSpace : 0);

      let boundingRectangle: Rectangle = props.bounds ? positioningFunctions._getRectangleFromIRect(props.bounds) : new Rectangle (0, window.innerWidth - 15, 0, window.innerHeight);

      let targetRect: Rectangle = positioningFunctions._getTargetRect(boundingRectangle, props.targetElement, props.creationEvent, props.targetPoint, props.useTargetPoint);

      let positionedCallout: positioningFunctions.ICallout = positioningFunctions._positionCalloutWithinBounds(positioningFunctions._getRectangleFromHTMLElement(calloutElement), targetRect, boundingRectangle, props.directionalHint, gap);
      let beakPositioned: Rectangle = positioningFunctions._positionBeak(beakWidth, positionedCallout, targetRect);
      let finalizedCallout = positioningFunctions._finalizeCalloutPosition(positionedCallout.calloutRectangle, hostElement);

      return { calloutPosition: { top: finalizedCallout.top, left: finalizedCallout.left },
        beakPosition: { top: beakPositioned.top, left: beakPositioned.left, display: 'block'},
        directionalClassName: SLIDE_ANIMATIONS[positionedCallout.targetEdge] };
    }

export module positioningFunctions {

    export interface ICallout {
    calloutRectangle: Rectangle;
    calloutEdge: RectangleEdge;
    targetEdge: RectangleEdge;
    alignPercent: number;
    beakPercent: number;
  }

    export function _getTargetRect(bounds: Rectangle, targetElement?: HTMLElement, ev?: MouseEvent,  targetPoint?: IPoint, isTargetPoint?: boolean): Rectangle {
      let targetRectangle: Rectangle;

      if (isTargetPoint) {
        if (targetPoint) {
          targetRectangle = new Rectangle(targetPoint.x, targetPoint.x, targetPoint.y, targetPoint.y);
        } else {
          targetRectangle = new Rectangle(ev.clientX, ev.clientX, ev.clientY, ev.clientY);
        }
      } else {
        if (!targetElement) {
          if (ev && ev.target) {
            targetRectangle = _getRectangleFromHTMLElement(ev.target as HTMLElement);
          }
          targetRectangle = new Rectangle();
        } else {
          targetRectangle = _getRectangleFromHTMLElement(targetElement);
        }
      }
      if (!_isRectangleWithinBounds(targetRectangle, bounds)) {
          let outOfBounds: RectangleEdge[] = _getOutOfBoundsEdges(targetRectangle, bounds);
          for (let direction of outOfBounds) {
              targetRectangle[RectangleEdge[direction]] = bounds[RectangleEdge[direction]];
        }
      }
      return targetRectangle;
    }

    export function _getRectangleFromHTMLElement(element: HTMLElement): Rectangle {
      let clientRect: ClientRect  = element.getBoundingClientRect();
      return new Rectangle(clientRect.left, clientRect.right, clientRect.top, clientRect.bottom);
    }

    export function _positionCalloutWithinBounds(
      calloutRectangle: Rectangle,
      targetRectangle: Rectangle,
      boundingRectangle: Rectangle,
      directionalHint: DirectionalHint,
      gap: number = 0): ICallout {
        let directionalInfo: PositionData = DirectionalDictionary[directionalHint];
        let estimatedRectangle: Rectangle = _moveRectangleToAnchorRectangle(calloutRectangle,
          directionalInfo.calloutDirection,
          directionalInfo.calloutPercent,
          targetRectangle,
          directionalInfo.targetDirection,
          directionalInfo.targetPercent,
          gap);

        if (_isRectangleWithinBounds(estimatedRectangle, boundingRectangle)) {
          return {calloutRectangle: estimatedRectangle, calloutEdge: directionalInfo.calloutDirection, targetEdge: directionalInfo.targetDirection, alignPercent: directionalInfo.calloutPercent, beakPercent: directionalInfo.beakPercent};
        } else {
          return _getBestRectangleFitWithinBounds(estimatedRectangle, targetRectangle, boundingRectangle, directionalHint, gap);
        }
    }

    export function _getBestRectangleFitWithinBounds(estimatedPosition: Rectangle, targetRectangle: Rectangle, boundingRectangle: Rectangle, directionalHint: DirectionalHint, gap: number) : ICallout {
      // If it can't possibly fit within the bounds just put it into it's initial position.
      let directionalInfo: PositionData = DirectionalDictionary[directionalHint];
      let callout: ICallout = {calloutRectangle: estimatedPosition,
        calloutEdge: directionalInfo.calloutDirection,
        targetEdge: directionalInfo.targetDirection,
        alignPercent: directionalInfo.calloutPercent,
        beakPercent: directionalInfo.beakPercent};

        if (!_canRectangleFitWithinBounds(estimatedPosition, boundingRectangle)) {
          return callout;
        }
        let outOfBounds: RectangleEdge[] = _getOutOfBoundsEdges(estimatedPosition, boundingRectangle);

        for (let direction of outOfBounds) {
          // If the direction that's out of bounds matches the target direction then we know we will need to flip
          // the rectangle to the opposite position;
          if (direction === directionalInfo.targetDirection) {
            callout.calloutRectangle = _moveRectangleToAnchorRectangle(callout.calloutRectangle,
              directionalInfo.targetDirection,
              callout.alignPercent,
              targetRectangle,
              directionalInfo.calloutDirection,
              directionalInfo.targetPercent,
              gap);
            callout.calloutEdge = directionalInfo.targetDirection;
            callout.targetEdge = directionalInfo.calloutDirection;
          } else {
            callout.calloutRectangle = _alignEdgeToCoordinate(callout.calloutRectangle, boundingRectangle[RectangleEdge[direction]], direction);
            let adjustedPercent: number = _recalculateMatchingPercents(callout.calloutRectangle, callout.targetEdge, targetRectangle, callout.targetEdge, directionalInfo.targetPercent);
            callout.alignPercent = adjustedPercent;
            callout.beakPercent = adjustedPercent;
          }
        }
        return callout;
    }

    export function _positionBeak(beakWidth: number, callout: ICallout, targetRectangle: Rectangle): Rectangle {
      let calloutRect: Rectangle = new Rectangle (0, callout.calloutRectangle.width, 0, callout.calloutRectangle.height);
      let beakRectangle: Rectangle = new Rectangle (0, beakWidth, 0, beakWidth);
      let recalculatedPercent: number = _recalculateMatchingPercents(callout.calloutRectangle, callout.calloutEdge, targetRectangle, callout.targetEdge, callout.beakPercent);
      let estimatedTargetPoint: IPoint = _getPointOnEdgeFromPercent(calloutRect, callout.calloutEdge, recalculatedPercent);

      return _finalizeBeakPosition(beakRectangle, callout, estimatedTargetPoint);
    }

    export function _finalizeBeakPosition(beakRectangle: Rectangle, callout: ICallout, estimatedTargetPoint: IPoint): Rectangle {
      let beakPixelSize: number = _calculateActualBeakWidthInPixels(beakRectangle.width) / 2;
      let innerRect: Rectangle = null;
      let beakPoint: IPoint = {x: beakRectangle.width / 2, y: beakRectangle.width / 2};

      if (callout.calloutEdge === RectangleEdge.bottom || callout.calloutEdge === RectangleEdge.top ) {
        innerRect = new Rectangle (beakPixelSize, callout.calloutRectangle.width - beakPixelSize, 0, callout.calloutRectangle.height);
      } else {
        innerRect = new Rectangle (0, callout.calloutRectangle.width, beakPixelSize, callout.calloutRectangle.height - beakPixelSize);
      }

      let finalPoint: IPoint = _getClosestPointOnEdgeToPoint(innerRect, callout.calloutEdge, estimatedTargetPoint);
      return _movePointOnRectangleToPoint(beakRectangle, beakPoint, finalPoint) ;
    }

    export function _getRectangleFromIRect(rect: IRect): Rectangle {
      return new Rectangle(rect.left, rect.right, rect.top, rect.bottom);
    }

    export function _finalizeCalloutPosition(calloutRectangle: Rectangle, hostElement: HTMLElement): Rectangle {
      let hostRect: Rectangle = _getRectangleFromHTMLElement(hostElement);
      let topPosition = calloutRectangle.top - hostRect.top;
      let leftPosition = calloutRectangle.left - hostRect.left;
      return new Rectangle (leftPosition, leftPosition + calloutRectangle.width, topPosition, topPosition + calloutRectangle.height);
    }

    /**
     * Finds the percent on the recalculateRect that matches the percent on the target rect based on position.
     */
    export function _recalculateMatchingPercents(recalculateRect: Rectangle, rectangleEdge: RectangleEdge, targetRect: Rectangle, targetEdge: RectangleEdge, targetPercent: number): number {
      let targetPoint: IPoint = _getPointOnEdgeFromPercent(targetRect, targetEdge, targetPercent);
      let adjustedPoint: IPoint = _getClosestPointOnEdgeToPoint(recalculateRect, rectangleEdge, targetPoint);
      let adjustedPercent: number = _getPercentOfEdgeFromPoint(recalculateRect, rectangleEdge, adjustedPoint);
      if (adjustedPercent > 100) {
        adjustedPercent = 100;
      } else if (adjustedPercent < 0) {
        adjustedPercent = 0;
      }
      return adjustedPercent;
    }

    export function _canRectangleFitWithinBounds(rect: Rectangle, boundingRect: Rectangle): boolean {
      if (rect.width > boundingRect.width || rect.height > boundingRect.height) {
        return false;
      }
      return true;
    }

    export function _isRectangleWithinBounds(rect: Rectangle, boundingRect: Rectangle): boolean {
      if (rect.top < boundingRect.top) {
        return false;
      }
      if (rect.bottom > boundingRect.bottom) {
        return false;
      }
      if (rect.left < boundingRect.left) {
        return false;
      }
      if (rect.right > boundingRect.right) {
        return false;
      }
      return true;
    }

    /**
     * Gets all of the edges of a rectangle that are outside of the given bounds.
     * If there are no out of bounds edges it returns an empty array.
     */
    export function _getOutOfBoundsEdges(rect: Rectangle, boundingRect: Rectangle): RectangleEdge[] {
      let outOfBounds: RectangleEdge[] = new Array<RectangleEdge>();
      if (rect.top < boundingRect.top) {
        outOfBounds.push(RectangleEdge.top);
      }
      if (rect.bottom > boundingRect.bottom) {
        outOfBounds.push(RectangleEdge.bottom);
      }
      if (rect.left < boundingRect.left) {
        outOfBounds.push(RectangleEdge.left);
      }
      if (rect.right > boundingRect.right) {
        outOfBounds.push(RectangleEdge.right);
      }
      return outOfBounds;
    }

    /**
     * Returns a point on a edge that is x% of the way down it.
     */
    export function _getPointOnEdgeFromPercent(rect: Rectangle, direction: RectangleEdge, percentOfRect: number): IPoint {
      let startPoint: IPoint;
      let endPoint: IPoint;
      switch (direction) {
        case RectangleEdge.top:
          startPoint = {x: rect.left, y: rect.top};
          endPoint = {x: rect.right, y: rect.top};
          break;
        case RectangleEdge.left:
          startPoint = {x: rect.left, y: rect.top};
          endPoint = {x: rect.left, y: rect.bottom};
          break;
        case RectangleEdge.right:
          startPoint = {x: rect.right, y: rect.top};
          endPoint = {x: rect.right, y: rect.bottom};
          break;
        case RectangleEdge.bottom:
          startPoint = {x: rect.left, y: rect.bottom};
          endPoint = {x: rect.right, y: rect.bottom};
          break;
        default:
          startPoint = {x: 0, y: 0};
          endPoint = {x: 0, y: 0};
          break;
      }
      return _calculatePointPercentAlongLine(startPoint, endPoint, percentOfRect);
    }

    /**
     * Gets the percent down an edge that a point appears.
     */
    export function _getPercentOfEdgeFromPoint(rect: Rectangle, direction: RectangleEdge, valueOnEdge: IPoint): number {
      switch (direction) {
        case RectangleEdge.top:
        case RectangleEdge.bottom:
          return rect.width !== 0 ? (valueOnEdge.x - rect.left) / rect.width * 100 : 100;
        case RectangleEdge.left:
        case RectangleEdge.right:
          return rect.height !== 0 ? (valueOnEdge.y - rect.top) / rect.height * 100 : 100;
      }
    }

  /**
   * Percent is based on distance from left to right or up to down. 0% would be left most, 100% would be right most.
   */
    export function _calculatePointPercentAlongLine(startPoint: IPoint, endPoint: IPoint, percent: number): IPoint {
      let x: number = startPoint.x + ((endPoint.x - startPoint.x) * percent / 100);
      let y: number = startPoint.y + ((endPoint.y - startPoint.y) * percent / 100);
      return {x: x, y: y};
    }

    export function _moveTopLeftOfRectangleToPoint(rect: Rectangle, destination: IPoint): Rectangle {
      return new Rectangle(destination.x,
        destination.x + rect.width,
        destination.y,
        destination.y + rect.height);
    }

    /**
     * Aligns the given edge to the target coordinate.
     */
    export function _alignEdgeToCoordinate(rect: Rectangle, coordinate: number, direction: RectangleEdge) : Rectangle {
      switch (direction) {
        case RectangleEdge.top:
          return _moveTopLeftOfRectangleToPoint(rect, {x: rect.left, y: coordinate});
        case RectangleEdge.bottom:
          return _moveTopLeftOfRectangleToPoint(rect, {x: rect.left, y: coordinate - rect.height});
        case RectangleEdge.left:
          return _moveTopLeftOfRectangleToPoint(rect, {x: coordinate, y: rect.top});
        case RectangleEdge.right:
          return _moveTopLeftOfRectangleToPoint(rect, {x: coordinate - rect.width, y: rect.top});
      }
      return new Rectangle();
    }

    /**
     * Moves a point on a given rectangle to the target point. Does not change the rectangles orientation.
     */
    export function _movePointOnRectangleToPoint(rect: Rectangle, rectanglePoint: IPoint, targetPoint: IPoint) {
      let leftCornerXDifference = rectanglePoint.x - rect.left;
      let leftCornerYDifference = rectanglePoint.y - rect.top;

      return _moveTopLeftOfRectangleToPoint(rect, {x: targetPoint.x - leftCornerXDifference, y: targetPoint.y - leftCornerYDifference});
    }

    /**
     * Moves the given rectangle a certain number of pixels in the given direction;
     */
    export function _moveRectangleInDirection(rect: Rectangle, moveDistance: number, direction: RectangleEdge): Rectangle {
      let xModifier: number = 0;
      let yModifier: number = 0;
      switch (direction) {
        case RectangleEdge.top:
          yModifier = moveDistance * -1;
          break;
        case RectangleEdge.left:
          xModifier = moveDistance * -1;
          break;
        case RectangleEdge.right:
          xModifier = moveDistance;
          break;
        case RectangleEdge.bottom:
          yModifier = moveDistance;
          break;
      }
      return _moveTopLeftOfRectangleToPoint(rect, {x: rect.left + xModifier, y: rect.top + yModifier});
    }

    /**
     * Moves the given rectangle to an anchor rectangle.
     */
    export function _moveRectangleToAnchorRectangle(
    rect: Rectangle,
    rectSide: RectangleEdge,
    rectPercent: number,
    anchorRect: Rectangle,
    anchorSide: RectangleEdge,
    anchorPercent: number,
    gap: number = 0): Rectangle {
      let rectTargetPoint: IPoint = _getPointOnEdgeFromPercent(rect, rectSide, rectPercent);
      let anchorTargetPoint: IPoint = _getPointOnEdgeFromPercent(anchorRect, anchorSide, anchorPercent);
      let positionedRect = _movePointOnRectangleToPoint(rect, rectTargetPoint, anchorTargetPoint);
      return _moveRectangleInDirection(positionedRect, gap, anchorSide);
    }

    /**
     * Gets the closet point on an edge to the given point.
     */
    export function _getClosestPointOnEdgeToPoint(rect: Rectangle, edge: RectangleEdge, point: IPoint): IPoint {
      switch (edge) {
        case RectangleEdge.top:
        case RectangleEdge.bottom:
          let x: number;
          if (point.x > rect.right) {
            x = rect.right;
          } else if (point.x < rect.left) {
            x = rect.left;
          } else {
            x = point.x;
          }
          return {x: x, y: rect[RectangleEdge[edge]]};
        case RectangleEdge.left:
        case RectangleEdge.right:
          let y: number;
          if (point.y > rect.bottom) {
            y = rect.bottom;
          } else if (point.y < rect.top) {
            y = rect.top;
          } else {
            y = point.y;
          }
          return {x: rect[RectangleEdge[edge]], y: y};
      }
    }

    /**
     * Since the beak is rotated 45 degrees the actual height/width is the length of the diagonal.
     * If you remember highschool geometry that's a^2 + b^2 = c^2.
     * We still want to position the beak based on it's midpoint which does not change. It will
     * be at (beakwidth / 2, beakwidth / 2)
     */
    export function _calculateActualBeakWidthInPixels(beakWidth: number): number {
      return Math.sqrt(beakWidth * beakWidth * 2);
    }
}