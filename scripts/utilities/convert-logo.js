const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs');

// We use sharp to extract the alpha channel so potrace correctly maps the white text
sharp('./assets/images/logo1.png')
  .extractChannel('alpha') // Solid pixels become white, transparent become black
  .negate() // Now solid pixels are black, transparent are white (potrace looks for black)
  .toBuffer()
  .then(buffer => {
    potrace.trace(buffer, { optTolerance: 0.2, turnpolicy: potrace.Potrace.TURNPOLICY_MINORITY }, function(err, svg) {
      if (err) throw err;
      
      // Make the resulting SVG fill white by default to match your logo, or use currentColor for CSS control
      const formattedSvg = svg.replace(/fill="black"/g, 'fill="currentColor"');
      
      fs.writeFileSync('./assets/images/logo1.svg', formattedSvg);
      console.log('Successfully converted mostly-white logo1.png to logo1.svg using Alpha channel mapping!');
    });
  })
  .catch(err => console.error('Error processing image:', err));
