import * as PIXI from 'pixi.js-legacy';
import Animate from './modules/animate';
import Settings from './settings';

export default class App extends PIXI.Application {
  constructor() {
    super({
      antialias: true,
      transparent: false,
      resolution: 1,
      resizeTo: window,
    });
    this.settings = Settings;
    this.level = {
      number: null,
      state: {
        differences: 0,
        errors: 0,
        complete: 0,
      },
      gameObjects: {
        imageA: {
          image: null,
          marks: null,
        },
        imageB: {
          image: null,
          marks: null,
        },
        iconError: null,
        textDifferences: null,
        textErrors: null,
      },
    };
    this.init();
  }

  init() {
    this.animate = new Animate(this);
    const resources = this.getResources();
    this.loader.add(resources).load(() => {
      this.loadLevel(1);
    });
  }

  getResources() {
    const result = [];
    this.settings.levels.forEach((i) => {
      result.push(i.imageA.path);
      result.push(i.imageB.path);
    });
    return result;
  }

  loadLevel(id) {
    this.level.number = id;
    const levelData = this.getLevelData(id);
    this.level.state.complete = levelData.marks.length;
    this.initImage(this.level, 'imageA', levelData);
    this.initImage(this.level, 'imageB', levelData);
    this.initIconError(this.level);
    this.initCounters(this.level);
  }

  getLevelData(id) {
    return this.settings.levels.find((i) => i.id === id);
  }

  initImage(level, imageId, data) {
    const image = this.getImage(data[imageId].path);
    if (imageId === 'imageB') {
      image.position.set(0, image.height + 10);
    }
    level.gameObjects[imageId].image = image;

    this.bindImage(level, image);
    this.initImageMarks(level, imageId, image, data);

    this.stage.addChild(image);
  }

  bindImage(level, image) {
    image.interactive = true;
    image.on('pointertap', (e) => {
      e.stopPropagation();
      this.onPointertapImage(level, e.data.global);
    });
  }

  initImageMarks(level, imageId, image, data) {
    const marks = this.getMarks(data.marks);
    level.gameObjects[imageId].marks = marks;
    this.bindMarks(level, image, marks);
    this.addMarksToImage(image, marks);
  }

  initIconError(level) {
    const iconError = this.getIconError();
    iconError.alpha = 0;
    level.gameObjects.iconError = iconError;
    this.stage.addChild(iconError);
  }

  getIconError() {
    const container = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.lineStyle(4, 0xffffff, 0.5);
    bg.beginFill(0xff0000, 0.5);
    bg.drawCircle(0, 0, 30);
    bg.endFill();
    const shape = new PIXI.Graphics();
    shape
      .lineStyle(4, 0xffffff, 1)
      .moveTo(0, -12)
      .lineTo(0, 12);
    shape
      .lineStyle(4, 0xffffff, 1)
      .moveTo(-12, 0)
      .lineTo(12, 0);
    shape.rotation = 0.785398;
    container.addChild(bg, shape);
    return container;
  }

  initCounters(level) {
    const dataDifferences = {
      label: {
        text: 'Отличий найдено: ',
        color: '#FFFFFF',
      },
      value: {
        text: '0',
        color: '#00FF00',
      },
    };
    const dataErrors = {
      label: {
        text: 'Ошибок совершено: ',
        color: '#FFFFFF',
      },
      value: {
        text: '0',
        color: '#FF0000',
      },
    };

    const counterDifferences = this.getCounter(dataDifferences);
    const counterDifferencesYPos = this.getSumHeight([
      level.gameObjects.imageB.image.y,
      level.gameObjects.imageB.image.height,
      20,
    ]);
    counterDifferences.position.set(20, counterDifferencesYPos);
    level.gameObjects.textDifferences = counterDifferences.children[1];

    const counterErrors = this.getCounter(dataErrors);
    const counterErrorsYPos = this.getSumHeight([
      counterDifferences.y,
      counterDifferences.height,
      10,
    ]);
    counterErrors.position.set(20, counterErrorsYPos);
    level.gameObjects.textErrors = counterErrors.children[1];

    this.stage.addChild(counterDifferences, counterErrors);
  }

  getCounter(data) {
    const container = new PIXI.Container();
    const label = this.getText(data.label.text, data.label.color);
    const value = this.getText(data.value.text, data.value.color);
    value.position.set(label.width, 0);
    container.addChild(label, value);
    return container;
  }

  getImage(path) {
    const container = new PIXI.Container();
    const image = new PIXI.Sprite.from(path);
    container.addChild(image);
    return container;
  }

  getMarks(data) {
    const marks = [];
    data.forEach((data) => {
      const mark = this.getMark(data);
      marks[data.id] = mark;
    });
    return marks;
  }

  addMarksToImage(image, marks) {
    marks.forEach((mark) => {
      image.addChild(mark);
    });
  }

  bindMarks(level, image, marks) {
    marks.forEach((mark, key) => {
      mark.interactive = true;
      mark.on('pointertap', (e) => {
        e.stopPropagation();
        this.onPointertapMark(level, image, mark, key);
      });
    });
  }

  onPointertapImage(level, pos) {
    const { iconError } = level.gameObjects;
    iconError.position.set(pos.x, pos.y);
    this.animate.fadeInOut(iconError, 300, () => {
      if (level.state.differences !== level.state.complete) {
        level.state.errors++;
        level.gameObjects.textErrors.text = level.state.errors;
      }
    });
  }

  onPointertapMark(level, image, mark, key) {
    if (mark.alpha === 0) {
      if (level.gameObjects.imageA.image === image) {
        const m = level.gameObjects.imageB.marks[key];
        this.animate.fadeIn(m, 300);
      }
      if (level.gameObjects.imageB.image === image) {
        const m = level.gameObjects.imageA.marks[key];
        this.animate.fadeIn(m, 300);
      }
      this.animate.fadeIn(mark, 300, () => {
        level.state.differences++;
        level.gameObjects.textDifferences.text = level.state.differences;
        this.levelComplete();
      });
    }
  }

  getMark(data) {
    const container = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000, 1);
    graphics.drawCircle(data.x, data.y, 30);
    graphics.endFill();
    graphics.alpha = 0;
    graphics.interactive = true;
    container.addChild(graphics);

    const arc = new PIXI.Graphics();
    arc.lineStyle(8, 0xffffff, 1);
    arc.arc(data.x, data.y, 30, 0, 6.5);

    const arc2 = new PIXI.Graphics();
    arc2.lineStyle(4, 0x00ff00, 1);
    arc2.arc(data.x, data.y, 30, 0, 6.5);

    container.addChild(arc, arc2);
    container.alpha = 0;

    return container;
  }

  getText(text, fill) {
    const params = {
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'bold',
    };
    params.fill = fill ? fill : '#ffffff';
    const style = new PIXI.TextStyle(params);
    return new PIXI.Text(text, style);
  }

  getSumHeight(arr) {
    return arr.reduce((acc, cur) => acc + cur);
  }

  levelComplete() {
    const state = this.level.state;
    if (state.differences === state.complete) {
      if (this.level.number < this.settings.levels.length) {
        const id = this.level.number + 1;
        this.level.state.differences = null;
        this.clearStage();
        this.loadLevel(id);
      } else {
        console.log('Game Win');
      }
    }
  }

  clearStage() {
    for (var i = this.stage.children.length - 1; i >= 0; i--) {
      this.stage.removeChild(this.stage.children[i]);
    }
  }
}
