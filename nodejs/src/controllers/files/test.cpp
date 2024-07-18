#include <bits/stdc++.h>
#include <iostream>
#define ll long long

using namespace std;

void displayStr(vector<string> &strs){
	for(auto s: strs){
		cout<<s<<endl;
	}
	cout<<endl;
}

// TC: O(2^n)
// SC: O(2^n * n) ; 2^n subsets with each lenght of n
void generatePowerSetHF(string &s, vector<string> & strs, int i){
	if(i == s.size()) return ;

	int currentSize = strs.size();
	// if directly use, it will increase size of strs each time and loop will go on infinity
    for (int j = 0; j < currentSize; j++) {
		string new_str = strs[j] + s[i];
		strs.push_back(new_str);
	}

	strs.push_back(string(1,s[i]));
	generatePowerSetHF(s, strs, i+1);
}

vector<string> generatePowerSet(string s){
	vector<string> strs;
	if(s.empty()) return strs;
	generatePowerSetHF(s, strs, 0);
	return strs;
}


int main(){
	string s = "ggg";
	vector<string> ps = generatePowerSet(s);
	displayStr(ps);
}