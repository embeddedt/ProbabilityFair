/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var wheel1_chart;

var wasCorrect;

var wins = 0, losses = 0;

var colorNames = [
    'blue',
    'yellow',
    'red',
    'green'
];

var chosenColor;

var numSpins = 0;

var theSpot = 0;

var colorVals = [
    'rgba(0, 100, 255, 1)',
    'rgba(255, 255, 0, 1)',
    'rgba(255, 0, 0, 1)',
    'rgba(0, 255, 0, 1)'
];

var colorCombinations = [
"RED",
"YELLOW",
"GREEN",
"BLUE"
];

var numColors;

var buttonColors = [
    [],
    [],
    [],
    []
];

var segments = [];

var sortedColors = [];
var segmentColorNums = [];

if (!Array.prototype.indexOf)  Array.prototype.indexOf = (function(Object, max, min){
  "use strict";
  return function indexOf(member, fromIndex) {
    if(this===null||this===undefined)throw TypeError("Array.prototype.indexOf called on null or undefined");
    
    var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len);
    if (i < 0) i = max(0, Len+i); else if (i >= Len) return -1;
    
    if(member===void 0){ for(; i !== Len; ++i) if(that[i]===void 0 && i in that) return i; // undefined
    }else if(member !== member){   for(; i !== Len; ++i) if(that[i] !== that[i]) return i; // NaN
    }else                           for(; i !== Len; ++i) if(that[i] === member) return i; // all else

    return -1; // if the value was not found, then return -1
  };
})(Object, Math.max, Math.min);

$(window).resize(function() {
    var w = $(window).width();
    var h = $(window).height();
    var dim;
    if(w < h)
        dim = w;
    else
        dim = h;
    dim /= 2;
    if(dim > 400)
        dim = 400;
    console.log(dim);
    $("#wheel1-containing-div").css({ width: dim, height: dim });
    var fs =  dim / 8;
    if(fs > 32)
        fs = 32;
    $("#text-contents").css({ 'font-size': fs });
});

$.fn.animateRotate = function(angle, duration, easing, complete) {
  var args = $.speed(duration, easing, complete);
  var step = args.step;
  return this.each(function(i, e) {
    args.complete = $.proxy(args.complete, e);
    args.step = function(now) {
      
      $.style(e, 'transform', 'rotate(' + now + 'deg)');
      $.attr(e, 'data-transform-rot', now);
      if (step) return step.apply(e, arguments);
    };

    $({deg: parseFloat($.attr(e, 'data-transform-rot'))}).animate({deg: angle}, args);
  });
};

function summedArray(array) {
    var acc = 0;
    for(var i = 0; i < array.length; i++) {
        acc += array[i];
    }
    return acc;
}

function capitalizeFirstLetter(string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function remakeTheChart() {
    try { $("#nicework-dialog").dialog('close'); } catch (e) {}
    try { $("#incorrect-dialog").dialog('close'); } catch (e) {}
    $("#wheel1-div").animateRotate(-11.5, 0);
    numColors = [ 0, 0, 0, 0];
    var colorsRemaining = 16;
    /* First generate the number of each color */
    
    do {
        for(var i = 0; i < 4; i++) {
            if(numColors[i] === 0) {
                numColors[i]++;
                continue;
            }
        }
        numColors[getRandomInt(0, colorNames.length - 1)]++; 
    } while(summedArray(numColors) < 16);
    console.log(numColors);
    sortedColors = [];
    segmentColorNums = [ 0, 0, 0, 0];
    for(var i = 0; i < 16; i++) {
        var c = -1;
        do {
            c = getRandomInt(0, colorNames.length - 1);
        } while(numColors[c] === 0);
        segments[i] = colorNames[c];
        segmentColorNums[c]++;
        wheel1_chart.data.labels[i] = i;
        wheel1_chart.data.datasets[0].data[i] = 1 / 16;
        wheel1_chart.data.datasets[0].borderColor[i] = 'rgba(0, 0, 0, 1)';
        wheel1_chart.data.datasets[0].backgroundColor[i] = colorVals[c];
        numColors[c]--;
    }
    
    wheel1_chart.update();
    
    var usedIntegers = [];
    for(var i = 0; i < 4; i++) {
        var $button = $("#prob-button-" + i);
        var index = -1;
        do {
            index = getRandomInt(0, colorCombinations.length - 1);
        } while(usedIntegers.indexOf(index) !== -1);
        usedIntegers.push(index);
        buttonColors[i] = colorCombinations[index].split(',');
        for(var j = 0; j < buttonColors[i].length; j++) {
            buttonColors[i][j] = capitalizeFirstLetter(buttonColors[i][j]);
        }
        $button.text(buttonColors[i]);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function arrayFromMapKeys(theMap) {
    var arr = [];
    for (let [key, value] of theMap) {
        arr.push(key);
    }
    return arr;
}
/* Intersection of two maps */
/* Note that this assumes they both have the same value and no duplicates */
function intersection(map1, map2) {
    var result = new Map();
    var keys1 = arrayFromMapKeys(map1);
    var keys2 = arrayFromMapKeys(map2);
    var listOfKeys = keys1.filter(function(n) {
        return keys2.indexOf(n) !== -1;
    });
    console.log("Keys being used " + listOfKeys);
    for(var i = 0; i < listOfKeys.length; i++) {
        result.set(listOfKeys[i], map1.get(listOfKeys[i]));
    }
    return result;
}

function rotateAnim(spot, speed, self) {
    if(speed === undefined)
        speed = 1000;
    var spins = getRandomInt(10, 40);
    var rotateAngle = ((spot+1)*22.5)-11.5+(spins*360);
    var curAngle = parseFloat($("#wheel1-div").attr("data-transform-rot"));
    var buttonNum = parseInt(self.attr("data-button-num"));
    var maxFrequency;
    var maxFrequencyColor;
    var colorMap;
    if(buttonNum !== undefined && buttonColors[buttonNum] !== undefined) {
        /* Create a sorted list of the colors by number */
        colorMap = new Map();
        for(var i = 0; i < 4; i++) {
            colorMap.set(colorNames[i], segmentColorNums[i]);
        }
        colorMap[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
        };
        console.log("color frequency table:");
        for (let [key, value] of colorMap) {
            if(maxFrequency === undefined) {
                maxFrequencyColor = key;
                maxFrequency = parseInt(value);
            }
            console.log(key + ' - ' + value);
        }

        var buttonColor = buttonColors[buttonNum][0].toLowerCase();
        chosenColor = buttonColor;
        wasCorrect = (colorMap.get(buttonColor) === maxFrequency);
        
    }
    $("#wheel1-div").animateRotate(-rotateAngle, 500*(Math.abs(rotateAngle)/360), 'swing', function() {
        console.log("At spot " + spot + " is color " + segments[spot]);
        var wasColorEqual = true;
        
        $("#i-won-anyway").hide();
        if(chosenColor === segments[spot]) {
            wins++;
            $("#remember-info").hide();
            if(!wasCorrect)
                $("#i-won-anyway").show();
        } else {
            losses++;
            for (let [key, value] of colorMap) {
                if(maxFrequency !== parseInt(value))
                    break;
                if(segments[spot] !== key) {
                    wasColorEqual = false;
                    numSpins++;
                    if(numSpins === 3) {
                        $("#condense-this").hide();
                    }
                    $("#remember-info").show();
                    break;
                }
            }
            if(wasColorEqual) {
                $("#remember-info").hide();
            }
        }
        
        $("#wins").text(wins);
        $("#losses").text(losses);
        $(".chosen-color").text(chosenColor);
        $(".prob-button").attr("disabled", false);
        if(buttonNum !== undefined && buttonColors[buttonNum] !== undefined && wasCorrect) {
            $("#nicework-dialog").dialog({ modal: true });
        } else {
            $("#incorrect-dialog").dialog({ modal: true });
        }
        
    });
};
$(window).load(function() {
    var ctx = document.getElementById('wheel1').getContext('2d');
    document.getElementById('wheel1').style.backgroundColor = 'rgba(0, 0, 0, 0)';
    wheel1_chart = new Chart(ctx, {
        type: 'pie',
        data: {
            datasets: [{
                data: [ 1 ],
                backgroundColor: [
                    'rgba(242, 235, 164, 1)',
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            legend: {
            display: false
            },
            
            tooltips: {
                enabled: false
            },
            hover: {
                mode: null
            } 
        }
    });
    $("#wheel1-div").attr("data-transform-rot", 0);
    remakeTheChart();
    
    $(window).resize();
    $(".prob-button").click(function() {
        $(".prob-button").attr("disabled", true);
        theSpot = getRandomInt(0, 15);
        rotateAnim(theSpot, 100, $(this));
    });
});