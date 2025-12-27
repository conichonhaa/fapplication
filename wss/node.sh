#!/bin/sh

rac="/"
#rac="/sharedfolders/"
list="wss/node-server cryptogame/back-nodejs/_nodeServer6969"
for d in $list 
do
	doss=$rac$d
	api=`basename $doss`
	fic=$doss".js"
	doss=`dirname $fic`
	flag=$doss"/flag.txt"
	flagstop=$doss"/flagstop.txt"
	pm2 list | grep $api | grep online > /dev/null
	if [ $? -eq 0 ]; then
		if [ -f "$flag" ]; then
			chmod 755 $flag
			rm $flag
			pm2 restart $fic
		fi
		if [ -f $flagstop ]; then
			pm2 stop $fic
		fi
	else
		if [ ! -f "$flagstop" ]; then
			pm2 start $fic
		fi
	fi
	
done


