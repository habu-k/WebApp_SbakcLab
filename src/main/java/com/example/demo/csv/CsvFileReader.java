package com.example.demo.csv;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.example.demo.dto.ItemDto;

@Component
public class CsvFileReader {
	
	private final String filepath = "inCart.csv";
	
	//CSV全取得
	public List<ItemDto> csvReader() {
		
		List<ItemDto> list = new ArrayList<>();
		
		try(BufferedReader br = new BufferedReader(new FileReader(filepath))){
			
			String line;
			while((line = br.readLine()) != null) {
				if(line.startsWith("#")) {
					continue;
				}
				String[] str = line.split(",");
				list.add(new ItemDto(str[0], Integer.parseInt(str[1])));
			}
			
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			// TODO 自動生成された catch ブロック
			e.printStackTrace();
		}
		
		return list;
		
	}

}
