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
};

export const stateToStr = (state) => state.map(componentToStr).join(" + ");

// NOTE right now it is only for the direction-polarization basis
export const tensorToLaTeX = (tensor) => {
  const basis = ['>-', '>|', '^-', '^|', '<-', '<|', 'v-', 'v|'];
  const arrayContent = basis
    .map((outputBase) => basis
      .map((inputBase) => {
          let matrixElement = tensor.get(inputBase).get(outputBase);
          if (matrixElement === undefined || matrixElement === 0) {
            return "0";
          } else {
            if (matrixElement.re !== 0 && matrixElement.im !== 0) {
              if (matrixElement.im > 0) {
                return `${matrixElement.re.toFixed(3)} + ${matrixElement.im.toFixed(3)}i`;
              } else {
                return`${matrixElement.re.toFixed(3)} - ${Math.abs(matrixElement.im.toFixed(3))}i`;
              }
            } else if (matrixElement.re === 0) {
              return `${matrixElement.im.toFixed(3)}i`;
            } else if (matrixElement.im === 0) {
              return `${matrixElement.re.toFixed(3)}`;
            }
          }
        }
      ).join(' & ')
    )
    .join('\\\\');
  return `\\begin{bmatrix}${arrayContent}\\end{bmatrix}`;
}
