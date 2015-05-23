// displaying and printing states, operators etc
// as of now mostly for debugging purpose

export const componentToStr = (component) => {

  let amplitudeStr = "";
  
  if (component.re !== 0 && component.im !== 0) {
    if (component.im > 0) {
      amplitudeStr = `(${component.re.toFixed(3)} + ${component.im.toFixed(3)}i)`;
    } else {
      amplitudeStr = `(${component.re.toFixed(3)} - ${Math.abs(component.im.toFixed(3))}i)`;
    }
  } else if (component.re === 0) {
    amplitudeStr = `(${component.im.toFixed(3)}i)`;
  } else if (component.im === 0) {
    amplitudeStr = `(${component.re.toFixed(3)})`;
  }

  return `${amplitudeStr}*|${component.i},${component.j},${component.to})`;

}

export const stateToStr = (state) => state.map(componentToStr).join(" + ");
