var AA=2;

var outcomes;

var defender_total=0;
var attacker_total=0;
var defender_ipc=0;
var attacker_ipc=0;

var units=[
//	{name:'AA Gun',     cost:5,  attack:0, defend:1},
	{name:'Infantry',   cost:3,  attack:1, defend:2, 'type':'land'},
	{name:'Armor',      cost:5,  attack:3, defend:2, 'type':'land'},
	{name:'Transport',  cost:8,  attack:0, defend:1, 'type':'naval'},
	{name:'Submarine',  cost:8,  attack:2, defend:2, 'type':'naval'},
	{name:'Fighter',    cost:12, attack:3, defend:4, 'type':'air'},
	{name:'Bomber',     cost:15, attack:4, defend:1, 'type':'air'},
	{name:'Carrier',    cost:18, attack:1, defend:3, 'type':'naval'},
	{name:'Battleship', cost:24, attack:4, defend:4, 'type':'naval'},
];

var air_units=[4,5];

var order={
	'cost':[7,6,5,4,3,2,1,0],
	'defense':[7,4,6,3,1,0,5,2],
	'attack':[7,5,4,1,3,6,0,2]
	};

document.observe('dom:loaded', function() {
	
	$('delimiter').insert(new Element('td',{colspan:7}).update('\xa0'));
	
	$('defender').insert(new Element('td',{id:'td_def_order'}));
	$('attacker').insert(new Element('td',{id:'td_att_order'}));
	$('defender_numbers').insert(new Element('td').update('\xa0'));
	$('attacker_numbers').insert(new Element('td').update('\xa0'));
	for(var i=0; i<=4; i++)
	{
		$('defender').insert(new Element('td',{id:'td_def_'+i}));
		$('attacker').insert(new Element('td',{id:'td_att_'+i}));
		$('defender_numbers').insert(new Element('td').insert(new Element('div',{'class':'number def_number'}).update(i)));
		$('attacker_numbers').insert(new Element('td').insert(new Element('div',{'class':'number att_number'}).update(i)));
	}
	$('defender').insert(new Element('td',{id:'td_def_ipc'}));
	$('attacker').insert(new Element('td',{id:'td_att_ipc'}));
	$('defender_numbers').insert(new Element('td').update('\xa0'));
	$('attacker_numbers').insert(new Element('td').update('\xa0'));
	
	$('td_def_order').insert(new Element('div').update('order:'));
	$('td_att_order').insert(new Element('div').update('order:'));
	['cost','attack','defense'].each(function(field) {
		$('td_def_order').insert(new Element('label').update(field));
		$('td_def_order').insert(new Element('input',{id:'inp_def_ord_'+field,type:'radio',name:'def_ord',value: field,checked:field=='cost'}));
		$('td_def_order').insert(new Element('br'));
		
		$('td_att_order').insert(new Element('label').update(field));
		$('td_att_order').insert(new Element('input',{id:'inp_att_ord_'+field,type:'radio',name:'att_ord',value: field,checked:field=='cost'}));
		$('td_att_order').insert(new Element('br'));
	});
	
	var div=new Element('div',{id:'div_def_aa'});
	div.insert(new Element('span').update('AA Gun'));
	div.insert(new Element('input',{id:'inp_def_aa',type:'checkbox',class:'aa'}));
	$('td_def_1').insert(div);
	
	
	for(var i=0; i<units.length; i++)
	{
		var div=new Element('div',{id:'div_def_'+i});
		div.insert(new Element('span').update(units[i].name));
		div.insert(new Element('input',{id:'inp_def_'+i,class:'defender unit text',maxlength:2,value:'0'}));
		$('td_def_'+units[i].defend).insert(div);
		
		var div=new Element('div',{id:'div_att_'+i});
		div.insert(new Element('span').update(units[i].name));
		div.insert(new Element('input',{id:'inp_att_'+i,class:'attacker unit text',maxlength:2,value:'0'}));
		$('td_att_'+units[i].attack).insert(div);
		
		Event.observe('inp_def_'+i, 'change', ipcrecalc);
		Event.observe('inp_att_'+i, 'change', ipcrecalc);

	}
	
/*	
	units.each(function(u) {
		var div=new Element('div',{id:'div_def_'+lmnt.id});
		unit_div.insert(new Element('span').update(lmnt.name));
		unit_div.insert(new Element('input',{id:'def_'+lmnt.id,class:'defender unit',maxlength:2,value:'0'}));
		$('def_'+lmnt.defend).insert(unit_div);
		
		var unit_div=new Element('div',{id:'div_att_'+lmnt.id});
		unit_div.insert(new Element('span').update(lmnt.name));
		unit_div.insert(new Element('input',{id:'att_'+lmnt.id,class:'attacker unit',maxlength:2,value:'0'}));
		$('att_'+lmnt.attack).insert(unit_div);
	});
*/	
	
	//$('inp_att_0').observe('click', ipcrecalc);
	
	ipcrecalc(null);
	
	//outcomes[9]=1;
	//alert(outcomes.inspect());
	
	Event.observe('inputs', 'submit', start);
	Event.observe('swap', 'click', swap);
	
	
});

function ipcrecalc(evt)
{
	defender_total=0;
	attacker_total=0;
	
	defender_ipc=0;
	attacker_ipc=0;
	for(var i=0; i<units.length; i++)
	{
		var n=parseInt($('inp_def_'+i).getValue());
		if(!isNaN(n))
		{
			defender_total+=n;
			defender_ipc+=n*units[i].cost;
		}
		
		n=parseInt($('inp_att_'+i).getValue());
		if(!isNaN(n))
		{
			attacker_total+=n;
			attacker_ipc+=n*units[i].cost;
		}
	}
	
	outcomes=new Array(defender_total+attacker_total+1);
	
	$('td_def_ipc').update(defender_total+' units<br />'+defender_ipc+' ipc');
	$('td_att_ipc').update(attacker_total+' units<br />'+attacker_ipc+' ipc');
	
}

function start(evt)
{
	Event.stop(evt);
	
	var combat_type=determine_combat_type();
	
	for(var i=0; i<outcomes.length; i++)
	{
		outcomes[i]=0;
	}
	
	var defender0=new Array(9);
	var attacker0=new Array(9);
	
	var defender_sum0=0;
	var attacker_sum0=0;
	
	defender_wins=0;
	attacker_wins=0;
	
	for(var i=0; i<units.length; i++)
	{
		defender0[i]=parseInt($F('inp_def_'+i));
		defender_sum0+=defender0[i];
		attacker0[i]=parseInt($F('inp_att_'+i));
		attacker_sum0+=attacker0[i];
	}
	
	defender_stack0=[];
	attacker_stack0=[];
	
	if($('inp_def_ord_cost').checked) def_order=order.cost;
	else if ($('inp_def_ord_attack').checked) def_order=order.attack;
	else if ($('inp_def_ord_defense').checked) def_order=order.defense;
	
	if($('inp_att_ord_cost').checked) att_order=order.cost;
	else if ($('inp_att_ord_attack').checked) att_order=order.attack;
	else if ($('inp_att_ord_defense').checked) att_order=order.defense;

	def_order.each(function(i){
		for(j=0; j<parseInt($F('inp_def_'+i)); j++) defender_stack0.push(i);
	});
	
	att_order.each(function(i){
		for(j=0; j<parseInt($F('inp_att_'+i)); j++) attacker_stack0.push(i);
	});
	
	//alert(defender_stack0.inspect());
	
	var attacker_air_units=[];
	for(i=0; i<attacker_stack0.length; i++)
		if(units[attacker_stack0[i]].type=='air')
			attacker_air_units.push(i);
	
	var defender_naval_units=[];
	for(i=0; i<defender_stack0.length; i++)
		if(units[defender_stack0[i]].type=='naval')
			defender_naval_units.push(i);
			
	//alert(attacker_air_units.inspect());
	
	var simnum=parseInt($F('simnum'));
	
	for(var n=0; n<simnum; n++)
	{
		attacker=attacker0.clone();
		defender=defender0.clone();
		
		attacker_stack=attacker_stack0.clone();
		defender_stack=defender_stack0.clone();
		
		//pre-emprive strikes
		if(combat_type=='land')
		{
			// AA-guns
			
			var aa_hits=0;
			if($('inp_def_aa').checked)
			{
				for(i=0; i<attacker_air_units.length; i++)
				{
					if(roll()==1) aa_hits++;
				}
			}
			for(i=0; i<aa_hits; i++)
				attacker_stack.splice(attacker_air_units[i]-i,1);
			
			// Battleship
			var attacker_battleships=[];
			for(i=0; i<attacker_stack.length; i++)
			{
				if(attacker_stack[i]==7) // battleship
				{
					attacker_battleships.push(i);
					if(roll()<=units[7].attack) defender_stack.pop();
				}
			}
			for(i=0; i<attacker_battleships.length; i++)
				attacker_stack.splice(attacker_battleships[i]-i,1); // remove battleship
		}
		else if(combat_type=='naval')
		{
			for(i=0; i<attacker_stack.length; i++)
			{
				if(attacker_stack[i]==3) // submarine
				{
					if(roll()<=units[3].attack)
					{
						var j=defender_naval_units.pop()
						defender_stack.splice(j-i,1);
					}
				}
			}
		}
		
		defender_sum=defender_stack.length;
		attacker_sum=attacker_stack.length;
		
		while(defender_sum>0 && attacker_sum>0)
		{
			
			var attacker_hits=0;
			var defender_hits=0;
			
			for(i=0; i<attacker_stack.length; i++)
			{
				j=attacker_stack[i];
				if(roll()<=units[j].attack) attacker_hits++;
			}
			
			for(i=0; i<defender_stack.length; i++)
			{
				j=defender_stack[i];
				if(roll()<=units[j].defend) defender_hits++;
			}
			
			for(i=0; i<attacker_hits; i++)
				defender_stack.pop();
				
			for(i=0; i<defender_hits; i++)
				attacker_stack.pop();
				
			defender_sum=defender_stack.length;
			attacker_sum=attacker_stack.length;
				
		}
		
		//defender_sum=Math.max(defender_sum,0);
		//attacker_sum=Math.max(attacker_sum,0);
		
		if(attacker_sum==0 && defender_sum>0) defender_wins++;
		else if(attacker_sum>0 && defender_sum==0) attacker_wins++;
		
		var outcome=defender_stack0.length+attacker_sum-defender_sum;
		outcomes[outcome]++;
		
	}//*/
	
	var ties=simnum-attacker_wins-defender_wins;
	
	
	// presentera resultat
	$('results').update();
	$('outcome').update();
	
	/*var td=new Element('td',{colspan:7});
	td.insert(new Element('h3').update('Result of '+simnum+' simulations:'));
	td.insert(new Element('div').update('Attacker: '+attacker_wins+' ('+Math.round(100*attacker_wins/simnum)+'%)'));
	td.insert(new Element('div').update('Defender: '+defender_wins+' ('+Math.round(100*defender_wins/simnum)+'%)'));
	td.insert(new Element('div').update('Ties: '+ties+' ('+Math.round(100*ties/simnum)+'%)'));
	$('results').insert(td);*/
	
	var tr1=new Element('tr').insert(new Element('th').update('Probability'));
	var tr2=new Element('tr').insert(new Element('th').update('#outcomes'));
	var tr3=new Element('tr').insert(new Element('th').update('Winner units left'));
	var tr4=new Element('tr').insert(new Element('th').update('Winner IPC loss'));
	
	outcomes.each(function(y,i)
	{
		td=new Element('td');
		td.insert(new Element('div').update('\xa0').setStyle({'height': Math.round(400*y/simnum)+'px', 'width': Math.round(800/outcomes.length)+'px' , 'backgroundColor':'blue'}));
		td.insert(Math.round(100*y/simnum)+'%');
		//var h=Math.round(100*y/simnum);
		//var w=Math.round(100*y/simnum);
		td.setStyle({'verticalAlign': 'bottom'});

		tr1.insert(td);
		
		td=new Element('td');
		td.update(y);
		tr2.insert(td);
		
		td=new Element('td');
		td.update(Math.abs(i-defender_sum0));
		tr3.insert(td);
		
		td=new Element('td');
		td.update('..');
		tr4.insert(td);
	});
	
	var tr5=new Element('tr').insert(new Element('th').update('Summary'));
	
	td=new Element('td',{colspan:defender_sum0}).update('Defender: '+defender_wins+' ('+Math.round(100*defender_wins/simnum)+'%)');
	tr5.insert(td);
	td=new Element('td',{colspan:1}).update('Ties: <br />'+ties+'<br />('+Math.round(100*ties/simnum)+'%)');
	tr5.insert(td);
	td=new Element('td',{colspan:attacker_sum0}).update('Attacker: '+attacker_wins+' ('+Math.round(100*attacker_wins/simnum)+'%)');
	tr5.insert(td);
	
	$('outcome').insert(tr1);
	$('outcome').insert(tr2);
	$('outcome').insert(tr3);
	$('outcome').insert(tr4);
	$('outcome').insert(tr5);
}

function determine_combat_type()
{
	// om det finns någon båt på försvararens sida så är det ett sjöslag, annars land
	
	for(var i=0; i<units.length; i++)
	{
		if(units[i].type=='naval')
		{
			var n=parseInt($('inp_def_'+i).getValue())
			if(!isNaN(n)) if(n>0) return 'naval';
		}
	}
	return 'land';
	
}

function roll()
{
	return Math.floor(Math.random()*6+1);
}

function swap()
{
	for(var i=0; i<units.length; i++)
	{
		d=$('inp_def_'+i).getValue();
		a=$('inp_att_'+i).getValue();
		$('inp_def_'+i).setValue(a);
		$('inp_att_'+i).setValue(d);
	}
}