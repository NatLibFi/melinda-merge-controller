FILE="stats5"

CHK=`cat $FILE | grep "^CHK" | wc -l`
OK=`cat $FILE | grep "^OK" | wc -l`
ERR=`cat $FILE | grep "^ERR" | wc -l`

echo "CHK	$CHK"
echo "OK	$OK"
echo "ERR	$ERR"
echo ""
echo "Errors:"


cat $FILE | grep "^STAT_E" | cut -d' ' -f3- | sort | uniq -c | sort -rn | sed 's/^\s*//' | awk '{print $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16"\t"$1}'

echo ""
echo "Asteri 100,110,111 checks:"
cat $FILE | grep "^preferredIsAuthorized" | sort | uniq -c | sort -nr | sed 's/^\s*//' | awk '{print $2,$3,$4,$5"\t"$1}'


echo ""
echo "Info:"

cat $FILE | grep "^STAT" | sort | uniq -c | sort -rn | sed 's/^\s*//' | awk '{print $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16"\t"$1}'
