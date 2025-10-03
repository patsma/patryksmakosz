var $maskPosition0plus = $('#showPercent0plus rect'),
    $maskPosition0minus = $('#showPercent0minus rect'),
    $maskPositionAplus = $('#showPercentAplus rect'),
    $maskPositionAminus = $('#showPercentAminus rect'),
    $maskPositionBplus = $('#showPercentBplus rect'),
    $maskPositionBminus = $('#showPercentBminus rect'),
    $maskPositionABplus = $('#showPercentABplus rect'),
    $maskPositionABminus = $('#showPercentABminus rect')

;
var bloodTl =  new TimelineMax();

bloodTl
    .add('fillDrops')
  .to($maskPosition0plus,2,{yPercent:-60},'fillDrops')
  .to($maskPosition0minus,2,{yPercent:-73},'fillDrops')
  .to($maskPositionAplus,2,{yPercent:-100},'fillDrops')
  .to($maskPositionAminus,2,{yPercent:-42},'fillDrops')
  .to($maskPositionBplus,2,{yPercent:-42},'fillDrops')
  .to($maskPositionBminus,2,{yPercent:-42},'fillDrops')
  .to($maskPositionABplus,2,{yPercent:-42},'fillDrops')
  .to($maskPositionABminus,2,{yPercent:-42},'fillDrops')
;