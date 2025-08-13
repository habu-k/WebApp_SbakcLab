package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.csv.CsvFileReader;
import com.example.demo.csv.CsvFileWriter;
import com.example.demo.dto.ItemDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * CSVファイルの読み書きや変換を行うメソッドをまとめたServiceクラス
 * 堂前
 */

@Service
public class SnackLabService {
	
	@Autowired
	CsvFileReader reader;
	
	@Autowired
	CsvFileWriter writer;
	
	//CSVファイルを読み込んで、Listにして返す
	public List<ItemDto> getAllInCart() {
		List<ItemDto> list = reader.csvReader();
		return list;
	}
	
	//Listで受け取ったカート内データをCSVに書き込む
	public void writeAllInCart(List<ItemDto> list) {
		writer.csvWriter(list);
	}
	
	//受け取ったカート内データをJavaScriptのCSVファイル形式にして返す
	public String getCsvFileForJs(List<ItemDto> list) {
		
		//JavaScriptの形に変換したCSV文字列を入れる変数
		String escapedCsv = "";
		
		//CSVファイルをJavaScriptの形式に変換
    	String csv = list.stream()
    	        .map(item -> item.getName() + "," + item.getCount())
    	        .collect(Collectors.joining("\n"));

    	try {
    	    // 文字列をJSON文字列としてエスケープ（JavaScriptで文字列として扱うため）
    		escapedCsv = new ObjectMapper().writeValueAsString(csv);
    	} catch (JsonProcessingException e) {
    	    e.printStackTrace();
    	}
    	
    	return escapedCsv;

	}
	
	//CSVファイルの中身を全削除
	public void clearCsvFile() {
		
		//空のListを書き込ませることで削除
		List<ItemDto> list = new ArrayList<>();
		writer.csvWriter(list);
	}

}
