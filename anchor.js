var s = "If you want to jumpstart the process of talking to us about this role, here’s a little challenge: write a program that outputs the largest unique set of characters that can be removed from this paragraph without letting its length drop below 50";
var array = [];
var set = new Set();
var str = "";


for (var i = 0; i < s.length; i++)
{
  if (!set.has(s.charAt(i)) && s.length - array.length > 50)
  {
    set.add(s.charAt(i))
    array.push(s.charAt(i));
    str += '\''+s.charAt(i) + '\',' ;
  }
}
console.log(str);
