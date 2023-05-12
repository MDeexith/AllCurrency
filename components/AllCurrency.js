import React, { useState, useEffect } from 'react'
import { Text, View, StatusBar, TouchableHighlight, Dimensions, ScrollView } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import DropDownPicker from 'react-native-dropdown-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import API_TOKEN  from "./token"
import { LineChart } from "react-native-chart-kit"
import { TextInput } from 'react-native-paper'
import styles from './Style'

export default function AllCurrency() {
  const API_URL = "https://api.apilayer.com/exchangerates_data/"
  const [amt1, setAmt1] = useState(1)
  const [amt2, setAmt2] = useState(null)
  const [cur1, setCur1] = useState('INR')
  const [cur2, setCur2] = useState('USD')
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [converting, setConverting] = useState(false)
  const [adding, setAdding] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [history, setHistory] = useState([])
  const [oldRates, setOldRates] = useState({})
  const [graphData, setGraphData] = useState({})
  const MAX_FAV_LEN = 5
  const [deleting, setDeleting] = useState(false)

  useEffect(()=>{
    const getData = async()=>{
      try {
        let headers = new Headers()
        headers.append("apikey", API_TOKEN)

        let requestOptions = {
          method: 'GET',
          redirect: 'follow',
          headers: headers
        }
        const raw = await fetch(`${API_URL}symbols`, requestOptions)
        if(raw.status!==200){
          throw Error("Couldn't fetch symbols")
        }
        
        const res = await raw.json()
        if(!res.success) throw Error("Couldn't fetch symbols")

        let curList = [], symstr = ""
        for (let k in res.symbols) {
          curList.push({label: res.symbols[k], value: k})
          symstr += k+'%2c'
        }

        const raw2 = await fetch(`${API_URL}latest?symbols=${symstr}&base=USD`, requestOptions)

        if(!raw2 || raw2.status!==200){
          throw Error("Couldn't fetch rates")
        }

        const res2 = await raw2.json()
        if(!res.success) throw Error("Couldn't fetch rates")
        else setOldRates(res2)

        let jsonValue = JSON.stringify(res2)
        await AsyncStorage.setItem('Rates', jsonValue)

        jsonValue = JSON.stringify(curList)
        await AsyncStorage.setItem('List', jsonValue)
        setItems(curList)
        console.log("Success")
      } catch (error) {
        console.log(error)
        let jsonValue = await AsyncStorage.getItem('List')

        if(!jsonValue){
          console.log("No offline symbols available")
        }
        else setItems(JSON.parse(jsonValue))

        jsonValue = await AsyncStorage.getItem('Rates')
        if(!jsonValue){
          console.log("No offline rates available")
        }
        else setOldRates(JSON.parse(jsonValue))
      }
      setLoading(false)
    }

    getData()

    const getFavorites = async () => {
      let jsonValue = await AsyncStorage.getItem('Favorites')
      if(!jsonValue) return
      setFavorites(JSON.parse(jsonValue))
    }
    getFavorites()

    const getHistory = async () => {
      let jsonValue = await AsyncStorage.getItem('History')
      if(!jsonValue) return
      setHistory(JSON.parse(jsonValue))
    }
    getHistory()
  }, [])

  const onCur1Open = ()=>{
    setOpen2(false)
  }
  const onCur2Open = ()=>{
    setOpen1(false)
  }
  const favorite = async()=>{
    if(items.length===0){
      return
    }

    setAdding(true)
    const temp = favorites
    for(let x of temp){
      if(x.cur1===cur1 && x.cur2===cur2){ /* Repeated pair */
        setTimeout(()=>setAdding(false), 1000)
        return
      }
    }
    temp.push({cur1, cur2})
    if(temp.length>MAX_FAV_LEN){
      temp.shift()
    }
    let jsonValue = JSON.stringify(temp)
    await AsyncStorage.setItem('Favorites', jsonValue)
    setFavorites(temp)
    setTimeout(()=>setAdding(false), 1000)
  }
  const convert = async()=>{
    if(!oldRates.rates){
      return
    }
    setConverting(true)

    const temp = history
    let found = false
    for(let x of temp){
      if(x.cur1===cur1 && x.cur2===cur2){ /* Repeated pair */
        found = true
        break
      }
    }

    if(!found){
      temp.push({cur1, cur2})
      if(temp.length>MAX_FAV_LEN){
        temp.shift()
      }
      let jsonValue = JSON.stringify(temp)
      await AsyncStorage.setItem('History', jsonValue)
      setHistory(temp)
    }

    let res = amt1*(oldRates.rates[cur2]/oldRates.rates[cur1])
    setAmt2(res.toFixed(8))
    setTimeout(()=>setConverting(false), 1000)
  }
  const generateGraph = async()=>{
    setGenerating(true)
    try {
      let headers = new Headers()
      headers.append("apikey", API_TOKEN)
      let requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: headers
      }
      let end_date = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10)
      let start_date = new Date(new Date().setDate(new Date().getDate() - 21)).toISOString().slice(0, 10)

      const raw = await fetch(`https://api.apilayer.com/exchangerates_data/timeseries?start_date=${start_date}&end_date=${end_date}&base=${cur1}&symbols=${cur2}`, requestOptions)

      if(!raw || raw.status!==200){
        console.log(raw)
        throw Error("Couldn't fetch timeseries")
      }
      
      const res = await raw.json()
      if(!res.success) throw Error("Couldn't fetch timeseries")
      const temp_labels = []
      const temp_data = []

      for(let x in res.rates){
        temp_labels.push(x.slice(8))
        temp_data.push(res.rates[x][cur2])
      }
      setGraphData({labels: temp_labels, data: temp_data})
    } catch (error) {
      console.log(error)
    }
    setTimeout(()=>setGenerating(false), 1000)
  }

  const usePair = async(c1, c2)=>{
    setCur1(c1)
    setCur2(c2)
  }

  const del = async(c1, c2)=>{
    setDeleting(true)
    const temp = favorites
    for(let i=0; i<temp.length; i++){
      if(temp[i].cur1===c1 && temp[i].cur2===c2){
        temp.splice(i, 1)
        break
      }
    }
    let jsonValue = JSON.stringify(temp)
    await AsyncStorage.setItem('Favorites', jsonValue)
    setFavorites(temp)
    setTimeout(()=>setDeleting(false), 2000)
  }



  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.main}>
        <StatusBar backgroundColor="white" 
        barStyle="dark-content"
        />
        <ScrollView >
          <View style={styles.maincont}>
            <Text style={styles.text}>Currency Converter</Text>
            {oldRates.date ? <Text style={styles.text}>(last updated: {oldRates.date})</Text>
            : <Text style={styles.text}>(conversion rates unavailable)</Text>}
          </View>
          <View style={styles.inputview}>
            <Text style={styles.text}>Amount</Text>
            <TextInput 
             value={`${amt1}`} 
             inputMode="numeric"
             style={styles.input}
             mode="flat"
            onChangeText={setAmt1} 
            textColor='black'
            selectionColor='#A9A9A9'
            underlineColor='white'
            activeUnderlineColor='white'
            placeholder="Enter amount 1" 
            onEndEditing={convert}/>
          </View>
          <View style={{flexDirection:"row", margin:5, gap:5}}>
            <View style={{flex:1}}>
              <Text style={[styles.text,{textAlign:"center"}]}>From</Text>
              <DropDownPicker
                loading={loading}
                open={open1}
                value={cur1}
                items={items}
                setOpen={setOpen1}
                onOpen={onCur1Open}
                setValue={setCur1}
                theme="DARK"
                textStyle={{
                  color: 'black',
                  fontWeight: 'bold'
                }}
                style={styles.dropdown}
                searchable={true}
                searchContainerStyle={styles.search}
                searchTextInputStyle={styles.searchtext}
                searchTextInputProps={{
                    selectionColor:"#000",
                }}
                searchPlaceholder='Search for a currency'
                listMode="MODAL"
                modalAnimationType='slide'
                transparent={true}
                modalContentContainerStyle={styles.modal}
              />
            </View>
            <View style={{flex:1}}>
              <Text style={[styles.text,{textAlign:"center"}]}>To</Text>
              <DropDownPicker
                loading={loading}
                open={open2}
                value={cur2}
                items={items}
                setOpen={setOpen2}
                onOpen={onCur2Open}
                setValue={setCur2}
                theme="DARK"
                textStyle={{
                  color: 'black',
                  fontWeight: 'bold'
                }}
                style={styles.dropdown}
                searchable={true}
                searchContainerStyle={styles.search}
                searchTextInputStyle={styles.searchtext}
                searchTextInputProps={{
                    selectionColor:"#000",
                }}
                listMode="MODAL"
                modalAnimationType='slide'
                transparent={true}
                modalContentContainerStyle={styles.modal}
              />
            </View>
          </View>
          <View >
            <TouchableHighlight disabled={converting} onPress={()=>{convert()}}
            style={[styles.button,{borderColor:"#FFA501", borderWidth:1}]}
            activeOpacity={1}
            underlayColor="#FFA501"
            >
                <Text style={styles.buttontext}>{converting ? "Converting..." : "Convert"}</Text>
            </TouchableHighlight>
          </View>
          <View style={{flexDirection:"row"}}>
            <View style={{flex:1}}>
              <TouchableHighlight disabled={adding} onPress={favorite} 
              style={[styles.button,{backgroundColor:"#AFEEEE",borderColor:"#4FC3F7", borderWidth:1}]}
              activeOpacity={1}
                underlayColor="#4FC3F7"
              >
                <Text style={styles.buttontext}>{adding ? "Adding..." : "Add to favorites"}</Text>
              </TouchableHighlight>
            </View>
            <View style={{flex:1}}>
              <TouchableHighlight disabled={generating} onPress={generateGraph}
              style={[styles.button,{backgroundColor:"#90EE90",borderColor:"#32CD32", borderWidth:1}]}
              activeOpacity={1}
                underlayColor="#32CD32"
              >
                <Text style={styles.buttontext}>{generating ? "Generating..." : "Get Rate Chart"}</Text>
              </TouchableHighlight>
            </View>
          </View>
          {amt2===null ? <></> : <View style={{}}>
            <Text style={[styles.text,{fontWeight:"bold",fontSize:20,flex:1,padding: 5,
        }]}>Result</Text>
            <Text style={styles.result}>{amt2}</Text>
          </View>}
          {favorites.length===0 ? <></> : <View style={{margin:10}}>
            <Text style={styles.headtext}>Favorites</Text>
            <Text style={styles.infotext}>(atmost {MAX_FAV_LEN})</Text>
            {favorites.map((e, i)=>{
              return <View style={{flexDirection:"row", alignItems:"center"}} key={i}> 
                <Text style={[styles.text,{flex:2, fontSize:18,fontWeight:"600"}]}>{i+1+'. '+e.cur1+' to '+e.cur2}</Text>
                <View style={{flex:1, flexDirection:"row"}}>
                  <TouchableHighlight onPress={()=>usePair(e.cur1, e.cur2)} 
                   style={styles.usebtu}
                   activeOpacity={1}
                    underlayColor="#FF1493"
                  >
                    <Text style={styles.buttontext}>Use</Text>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={()=>del(e.cur1, e.cur2)} 
                   style={[styles.usebtu,{backgroundColor:"#FF0000", borderColor:"#8B0000"}]}
                   activeOpacity={1}
                    underlayColor="#8B0000"
                  >
                    <Text style={styles.buttontext}>{deleting ? "Deleting..." : "Delete"}</Text>
                  </TouchableHighlight>
                </View>
              </View>
            })}
          </View>}
          {history.length===0 ? <></> : <View style={{margin:10}}>
            <Text style={styles.headtext}>History</Text>
            <Text style={styles.infotext}>(last {MAX_FAV_LEN})</Text>
            {history.map((e, i)=>{
              return <View style={{flexDirection:"row", alignItems:"center"}} key={i}> 
                <Text style={[styles.text,{flex:3, fontSize:18,fontWeight:"600"}]}>{i+1+'. '+e.cur1+' to '+e.cur2}</Text>
                <View style={{flex:1}}>
                  <TouchableHighlight onPress={()=>usePair(e.cur1, e.cur2)} 
                   style={styles.usebtu}
                   activeOpacity={1}
                    underlayColor="#FF1493"
                  >
                    <Text style={styles.buttontext}>Use</Text>
                  </TouchableHighlight>
                </View>
              </View>
            })}
          </View>}
          {!graphData.labels? <></> : <View>
            <View style={{margin:10}}>
              <Text style={[styles.text,{fontSize:16}]}>Rate Chart</Text>
            <Text style={styles.infotext}>(1{cur1} v/s {cur2})(14 days before 1 week)</Text>
            </View>
            <LineChart
              data={{
                labels: graphData.labels,
                datasets: [
                  {
                    data: graphData.data
                  }
                ]
              }}
              width={Dimensions.get("window").width-14}
              height={220}
              yAxisLabel=""
              yAxisSuffix={cur2}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#172B4D",
                backgroundGradientFrom: "#172B4D",
                backgroundGradientTo: "#172B4D",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 0
                },
                propsForDots: {
                  r: "2",
                  strokeWidth: "2",
                  stroke: "red"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                alignSelf:"center"
              }}
            />
          </View>}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}