import {MockD3} from '../test_utils/mock_d3';
import {ParticleAnimation} from './particle_animation';

describe('Particle animation', () => {
  let dummyAnimation;
  let finishCallback;
  let mockBoard;

  beforeEach(() => {
    mockBoard = {
      svg: new MockD3(),
    };
    finishCallback = jasmine.createSpy(null);
    // Allow d3 mock to be chainable
    spyOn(mockBoard.svg, 'append').and.callThrough();
    spyOn(mockBoard.svg, 'attr').and.callThrough();

    dummyAnimation = new ParticleAnimation(
      mockBoard,
      [],  // history
      [],  // measurementHistory
      [],  // absorptionProbabilities
      finishCallback,
      'defaultMode'
    );
    spyOn(dummyAnimation, 'nextFrame');
  });

  it('should initialize by playing and uninitialize by stopping', () => {
    expect(dummyAnimation.initialized).toBe(false);
    dummyAnimation.play();
    expect(dummyAnimation.initialized).toBe(true);
    dummyAnimation.pause();
    expect(dummyAnimation.initialized).toBe(true);
    dummyAnimation.stop();
    expect(dummyAnimation.initialized).toBe(false);
  });

  it('should call nextFrame by plaing', () => {
    dummyAnimation.play();
    expect(dummyAnimation.nextFrame).toHaveBeenCalled();
  });

  it('should stop playing by pausing', () => {
    expect(dummyAnimation.playing).toBe(false);
    dummyAnimation.play();
    expect(dummyAnimation.playing).toBe(true);
    dummyAnimation.pause();
    expect(dummyAnimation.playing).toBe(false);
  });

  it('should create and remove measurement and absorption texts', () => {
    dummyAnimation.play();
    expect(dummyAnimation.measurementTextGroup).toBeTruthy();
    // Check which element was removed
    spyOn(mockBoard.svg, 'remove');
    spyOn(dummyAnimation.measurementTextGroup, 'remove');
    spyOn(dummyAnimation.absorptionTextGroup, 'remove');
    dummyAnimation.stop();
    expect(mockBoard.svg.remove).not.toHaveBeenCalled();
    expect(dummyAnimation.measurementTextGroup.remove).toHaveBeenCalled();
    expect(dummyAnimation.absorptionTextGroup.remove).toHaveBeenCalled();
  });
});
