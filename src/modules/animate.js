class Animate {
  constructor(app) {
    this.app = app;
  }

  fadeInOut(obj, time, callback) {
    this.fadeIn(obj, time, () => {
      this.fadeOut(obj, time, callback);
    });
  }

  fadeIn(obj, time, callback) {
    obj.alpha = 0;
    const propAlpha = this.getProp('alpha', obj.alpha, 1, time);
    const props = [[obj, propAlpha]];
    this.animate(props, callback);
  }

  fadeOut(obj, time, callback) {
    obj.alpha = 1;
    const propAlpha = this.getProp('alpha', obj.alpha, -1, time);
    const props = [[obj, propAlpha]];
    this.animate(props, callback);
  }

  showUp(obj, value, time, callback) {
    obj.alpha = 0;
    const propY = this.getProp('y', obj.y, value, time);
    const propAlpha = this.getProp('alpha', obj.alpha, 1, time);
    const props = [[obj, propY], [obj, propAlpha]];
    this.animate(props, callback);
  }

  getProp(prop, currentValue, value, time) {
    const direction = currentValue < value ? 1 : -1;
    const targetValue = currentValue + value;
    const deltaValue = value / (time / this.app.ticker.deltaMS);
    return {
      prop,
      targetValue,
      deltaValue,
      direction,
      copmleted: false,
    };
  }

  animate(props, callback) {
    const ani = () => {
      const completedUpdateProps = this.updateProps(props);
      if (completedUpdateProps) {
        if (callback) {
          callback();
        }
        this.app.ticker.remove(ani);
      }
    };
    this.app.ticker.add(ani);
  }

  updateProps(props) {
    let propsCompleted = 0;
    props.forEach((prop) => {
      const completedUpdateProp = this.updateProp(prop);
      if (completedUpdateProp) {
        propsCompleted++;
      }
    });
    return props.length === propsCompleted ? true : false;
  }

  updateProp(prop) {
    const params = prop[1];
    if (params.copmleted === false) {
      prop[0][params.prop] += params.deltaValue;
      const copmleteA =
        params.direction === 1 && prop[0][params.prop] >= params.targetValue;
      const copmleteB =
        params.direction === -1 && prop[0][params.prop] <= params.targetValue;
      const copmlete = copmleteA || copmleteB;
      if (copmlete) {
        prop[0][params.prop] = params.targetValue;
        params.copmleted = true;
      }
    }
    return params.copmleted;
  }
}

export default Animate;
