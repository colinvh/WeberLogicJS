{
    function Expression(expression) {
        this.expression = expression;
        this.toString = function () {
            return this.expression.toString();
        };
        this.truthTable = function () {
            var expression = this.expression;
            var predicates = this.expression.getPredicates();
            var items = [];
            for (var key in predicates) {
                items.push(key);
            }
            var permutations = getPermutations([true, false], items.length);
            items.sort();
            permutations.forEach(function(permutation) {
                for (var index in permutation) {
                    predicates[items[index]].forEach(function(predicate) {
                        predicate.value = permutation[index];
                    });
                }
                permutation.push(expression.evaluate());
            });
            items.push(this.toString());
            return [ items, permutations ];
        };
    }
    function Predicate(symbol) {
        this.symbol = symbol;
        this.value = false;
        this.toString = function () { 
            return this.symbol.toString();
        };
        this.getPredicates = function () {
            var result = {};
            result[this.symbol] = [this];
            return result;
        };
        this.evaluate = function () {
            return this.value;
        };
    }
    function Operator() {
    }
    function UnaryOperator(expression) {
        Operator.apply(this);
        this.expression = expression;
        this.getPredicates = function () {
            return this.expression.getPredicates();
        };
    }
    function Not(expression) { 
        UnaryOperator.apply(this, arguments);
        this.toString = function () {
            return "~" + expression;
        };
        this.evaluate = function () {
            return truthTable.not(expression.evaluate());
        };
    }
    function BinaryOperator(left_expression, right_expression) {
        Operator.apply(this);
        this.left_expression = left_expression;
        this.right_expression = right_expression;
        this.getPredicates = function() {
            var left_predicates = this.left_expression.getPredicates();
            var right_predicates = this.right_expression.getPredicates();
            var predicates = left_predicates;
            for (var key in right_predicates) {
                if (!predicates.hasOwnProperty(key)) {
                    predicates[key] = right_predicates[key];
                } else {
                    for (var index in right_predicates[key]) {
                        if (predicates[key].indexOf(right_predicates[key][index]) == -1) {
                            predicates[key].push(right_predicates[key][index]);
                        }
                    }
                }
            }
            return predicates;
        };
    }
    function And(left_expression, right_expression) {
        BinaryOperator.apply(this, arguments);
        this.toString = function () {
            return "(" + this.left_expression + "&" + this.right_expression + ")";
        };
        this.evaluate = function () {
            return truthTable.and(this.left_expression.evaluate(), this.right_expression.evaluate());
        };
    }
    function Or(left_expression, right_expression) {
        BinaryOperator.apply(this, arguments);
        this.toString = function () {
            return "(" + left_expression + "|" + right_expression + ")";
        };
        this.evaluate = function () {
            return truthTable.or(this.left_expression.evaluate(), this.right_expression.evaluate());
        };
    }
    function Implies(left_expression, right_expression) {
        BinaryOperator.apply(this, arguments);
        this.toString = function () {
            return "(" + left_expression + "->" + right_expression + ")";
        };
        this.evaluate = function () {
            return truthTable.implies(this.left_expression.evaluate(), this.right_expression.evaluate());
        };
    }
    function Iff(left_expression, right_expression) {
        BinaryOperator.apply(this, arguments);
        this.toString = function () {
            return "(" + left_expression + "<->" + right_expression + ")";
        };
        this.evaluate = function () {
            return truthTable.iff(this.left_expression.evaluate(), this.right_expression.evaluate());
        };
    }

    truthTable = {
        not: function(value) { return !value; },
        and: function(lhs, rhs) { return lhs && rhs; },
        or: function(lhs, rhs) { return lhs || rhs;  },
        implies: function(lhs, rhs) { return this.or(this.not(lhs), rhs); },
        iff: function(lhs, rhs) { return this.and(this.implies(lhs,rhs), this.implies(rhs,lhs)); } 
    };
    
    function getPermutations(items, length) {
        // [[a]] -> Int -> a -> [[a]] -> [[a]]
        function _getPermutations_(items, length, perm, permSet) {
            if (perm.length == length) {
                permSet.push(perm);
            } else {
                for (var index in items) {
                    var newPerm = perm.slice(0);
                    newPerm.push(items[index]);
                    _getPermutations_(items, length, newPerm, permSet);
                }
            }
            return permSet;
        }
        return _getPermutations_(items, length, [], []);
    }
}

expression = _ expression:level_1 _ { return new Expression(expression); }
 
level_1
      = _ left:level_2 _ right:_level_1_ _ { return right(left); }
      / _ x:level_2 _ { return x; }
_level_1_
      = _ "<->" _ right:level_1 _ { return function(left) { return new Iff(left, right) }};
 
level_2
    = _ left:level_3 _ "->" _ right:level_2 _ { return new Implies(left,right); }
    / _ x:level_3 _ { return x; }
 
level_3 
    = _ left:level_4 _ right:_level_3_ _ { return right(left); }
    / _ x:level_4 _ { return x; } 
_level_3_ 
    = _ "&" _ right:level_3 _ { return function(left) { return new And(left, right); } }
    / _ "|" _ right:level_3 _ { return function(left) { return new Or(left, right); } }
  
level_4 
    = _ "~" _ right:level_4 _ { return new Not(right); }
    / _ "(" _ x:expression _ ")" _ { return x; }
    / _ x:predicate _ { return x; }
 
predicate = letters:[A-Z]+ { 
    var x = new Predicate(letters.join('')); 
    return x 
}

_ = [ ]*
